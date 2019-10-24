class Minicart

  LineItem = Struct.new(:label, :reference, :price)

  def initialize(minicart_id, base_url)
    @cart_id = minicart_id
    @pricing = Carts.get_pricing
    @base_url = base_url

    @line_items = []
  end

  def add_cart(cart)
    cart.fetch(:digital_copy_requests).fetch(:set_price_records).each do |cart_item|
      @line_items << LineItem.new(cart_item.fetch(:record).fetch('display_string'),
                                  cart_item.fetch(:record).fetch('qsa_id_prefixed'),
                                  cart_item.fetch(:price))
    end
  end

  def add_registered_post
    @line_items << LineItem.new("Registered Mail", 'registered_mail', @pricing.fetch('registered_mail'))
  end

  def set_delivery_method(method)
    if method == 'usb'
      @line_items << LineItem.new("USB", 'usb', @pricing.fetch('usb'))
      @line_items << LineItem.new("USB (postage)", 'usb_postage', @pricing.fetch('usb_postage'))
    end
  end

  # The Minicart API requires us to use the same order number for a given cart
  # consistently.  If we don't have an order number yet then mint one.
  # Otherwise, use whatever we used last.
  def mint_order_number!(force_new = false)
    minter = Thread.new do
      DB.open do |db|
        if force_new
          db[:minicart].filter(:cart_id => @cart_id).delete
        end

        minicart = db[:minicart][:cart_id => @cart_id]

        if minicart
          minicart[:id] + AppConfig[:minicart_base_order_id]
        else
          pk = db[:minicart].insert(:cart_id => @cart_id)
          AppConfig[:minicart_base_order_id] + pk
        end
      end
    end

    minter.value
  end

  def submit!
    client = Savon.client(wsdl: AppConfig[:minicart_wsdl],
                          wsse_auth: [AppConfig[:minicart_user], AppConfig[:minicart_password], :digest],
                          endpoint: URI.parse(AppConfig[:minicart_endpoint]),
                          log_level: :debug,
                          log: true)

    10.times do |_retry|
      order_number = mint_order_number!

      $LOG.info("Assigned order number #{order_number} to cart #{@cart_id}")

      begin
        response = client.call(:cart_add,
                               message: {
                                 "cartId" => @cart_id,
                                 "order" => {
                                   "@id" => order_number,
                                   "onlineService" => {
                                     "@id" => AppConfig[:minicart_user],
                                     "@name" => AppConfig[:minicart_service_name],
                                     "@prev" => "#{@base_url}/digital-copies-cart/minicart",
                                   },
                                   "orderline" => @line_items.each_with_index.map {|line_item, idx|
                                     {
                                       "@id" => idx,
                                       "product" => {
                                         "@title" => line_item.label[0...99],
                                         "@ref" => line_item.reference,
                                         "@cost" => line_item.price,
                                         "@agency" => AppConfig[:minicart_service_name],
                                         "@disbursementId" => AppConfig[:minicart_disbursement_id],
                                       }
                                     }
                                   }.reverse
                                 }
                               })

        if response.body[:cart_add_response][:status] != 'OK'
          raise "Minicart add failed: #{response.inspect}"
        end

        return
      rescue Savon::SOAPFault => e
        fault = e.to_hash

        if fault[:fault][:faultstring].to_s =~ /Online Service Ref ID.*is already used/
          # Get another order number and try again
          order_number = mint_order_number!(force = true)
        else
          raise e
        end
      end
    end

    raise "Failure adding items to minicart"
  end

end
