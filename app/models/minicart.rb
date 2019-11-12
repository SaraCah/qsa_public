class Minicart

  LineItem = Struct.new(:label, :reference, :price)

  def initialize(minicart_id, base_url, notify_key)
    @cart_id = minicart_id
    @pricing = Carts.get_pricing
    @base_url = base_url
    @notify_key = notify_key

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
    client = self.class.client_for(AppConfig[:minicart_cart_wsdl])

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
                                     "@notify" => "#{@base_url}/api/minicart-notify/#{@notify_key}",
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
                                   }.reverse,
                                   "deliveryAddressRequest" => [
                                     { "@type" => "EMAIL" },
                                     { "@type" => "POST" },
                                   ],
                                   "customerDetailsRequest" => [
                                     { "@type" => "CUSTOMER", "@required" => "true" },
                                     { "@type" => "PHONE", "@required" => "true" },
                                     { "@type" => "EMAIL", "@required" => "true" },
                                     { "@type" => "POST", "@required" => "true" },
                                   ],
                                 }
                               })

        if response.body[:cart_add_response][:status] != 'OK'
          raise "Minicart add failed: #{response.inspect}"
        end

        return response.body[:cart_add_response][:generated_order_id]
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

  OrderSummary = Struct.new(:paid, :order_details)

  def self.retrieve_order_summary(generated_order_id)
    client = client_for(AppConfig[:minicart_order_wsdl])

    response = client.call(:order_status,
                           message: {
                             "generatedOrderId" => generated_order_id,
                             })

    if response.body[:order_status_response][:status] != 'PAID'
      return OrderSummary.new(false)
    end

    response = client.call(:order_query,
                           message: {
                             "generatedOrderId" => generated_order_id,
                           })

    OrderSummary.new(true, response.body[:order_query_response])
  end

  def self.client_for(wsdl)
    Savon.client(wsdl: wsdl,
                 wsse_auth: [AppConfig[:minicart_user], AppConfig[:minicart_password], :digest],
                 endpoint: URI.parse(AppConfig[:minicart_endpoint]),
                 log_level: :debug,
                 log: true)
  end
end
