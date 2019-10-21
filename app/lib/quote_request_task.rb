class QuoteRequestTask

  RequestItem = Struct.new(:record, :digital_copy_type, :digital_copy_delivery, :digital_copy_format, :digital_copy_resolution, :digital_copy_mode, :digital_copy_size, :digital_copy_notes) do
    def to_s
      result = to_h.merge({
        qsa_id: record.fetch('qsa_id_prefixed'),
        display_string: record.fetch('display_string', ''),
      })
      
      result.delete(:record)

      result.inspect
    end
  end

  def self.run_tasks(tasks)
    results = []

    Ctx.open do
      DB.open do |db|
        tasks.each do |task|
          # TODO:
          #
          #  * Grab the QuoteRequest ID from the blob
          #  * Look that up to get a list of Solr record IDs
          #  * Resolve those, coping with failure
          #  * Generate an email and log it (for now)
          #
          json = JSON.parse(task[:blob])

          quote_request = db[:quote_request][id: json.fetch('quote_request_id')]
          quote_request_items = db[:quote_request_item].filter(quote_request_id: quote_request[:id])

          item_ids = quote_request_items.map{|row| row[:item_id]}
          records = Search.get_records_by_ids(item_ids)

          request_items = quote_request_items.map do |row|
            RequestItem.new(records.fetch(row[:item_id]),
                            row[:digital_copy_type],
                            row[:digital_copy_delivery],
                            row[:digital_copy_format],
                            row[:digital_copy_resolution],
                            row[:digital_copy_mode],
                            row[:digital_copy_size],
                            row[:digital_copy_notes])
          end

          user = Users.get(quote_request[:user_id])

          email = Templates.emit(:quote_request_email, 
                                 {
                                   user: user,
                                   request_items: request_items,
                                   create_time: quote_request[:create_time],
                                 })

          static_dir = File.realpath(File.absolute_path(File.join(File.dirname(__FILE__), '..','..', 'static')))

          File.open(File.join(static_dir, 'emails.txt'), 'a') do |f|
            f << "\n************************************************************\n"
            f << email
            f << "\n************************************************************\n"
          end

          results << DeferredTaskRunner::TaskResult.new(task[:id], :success)
        end
      end
    end

    results
  end

end

