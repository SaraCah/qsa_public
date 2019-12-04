class DeferredTasks < BaseStorage

  PENDING_STATUS = 'pending'

  def self.add_task(task_type, task_blob)
    db[:deferred_task]
      .insert(type: task_type,
              blob: task_blob,
              status: PENDING_STATUS,
              retries_remaining: 10,
              create_time: java.lang.System.currentTimeMillis)
  end


  DigitalCopyQuoteRequest = Struct.new(:user, :requested_items) do
    def to_json(*args)
      to_h.to_json
    end
  end

  DigitalCopyQuoteRequestedItem = Struct.new(:item_id, :item_type, :item_qsa_id, :item_display_string, :digital_copy_type, :digital_copy_delivery, :digital_copy_format, :digital_copy_resolution, :digital_copy_mode, :digital_copy_size, :digital_copy_notes) do
    def to_json(*args)
      to_h.to_json
    end
  end

  def self.add_digital_copy_quote_request_task(quote_request_id, user)
    quote_request = db[:quote_request][id: quote_request_id]
    quote_request_items = db[:quote_request_item].filter(quote_request_id: quote_request[:id])

    item_ids = quote_request_items.map{|row| row[:item_id]}

    records = Search.get_records_by_ids(item_ids)

    requested_items = quote_request_items.map do |row|
      record = records.fetch(row[:item_id])
      DigitalCopyQuoteRequestedItem.new(row[:item_id],
                      record.fetch('jsonmodel_type'),
                      record.fetch('qsa_id_prefixed'),
                      record.fetch('display_string'),
                      row[:digital_copy_type],
                      row[:digital_copy_delivery],
                      row[:digital_copy_format],
                      row[:digital_copy_resolution],
                      row[:digital_copy_mode],
                      row[:digital_copy_size],
                      row[:digital_copy_notes])
    end

    task_blob = DigitalCopyQuoteRequest.new(user, requested_items).to_json

    add_task('quote_request', task_blob)
  end


  ClosedRecordRequest = Struct.new(:user, :agency, :purpose, :permission_to_copy, :requested_items) do
    def to_json(*args)
      to_h.to_json
    end
  end

  ClosedRecord = Struct.new(:item_id, :item_type, :item_qsa_id, :item_display_string, :controlling_record, :series, :dates, :rap_applied, :rap_expiration) do
    def to_json(*args)
      to_h.to_json
    end
  end

  def self.add_closed_record_request_task(agency_request_id, user)
    agency_request = db[:agency_request][id: agency_request_id]
    agency_request_items = db[:agency_request_item].filter(agency_request_id: agency_request_id)

    item_ids = agency_request_items.map{|row| row[:item_id]}
    records = Search.resolve_refs!(Search.get_records_by_ids(item_ids + [agency_request[:agency_id]]))

    agency = records.fetch(agency_request[:agency_id])

    requested_items = agency_request_items.map do |row|
      record = records.fetch(row[:item_id])
      controlling_record = record.fetch('controlling_record').fetch('_resolved')

      ClosedRecord.new(row[:item_id],
                       record.fetch('jsonmodel_type'),
                       record.fetch('qsa_id_prefixed'),
                       record.fetch('display_string'),
                       {
                        qsa_id: controlling_record.fetch('qsa_id_prefixed'),
                        display_string: controlling_record.fetch('display_string'),
                       },
                       {
                         qsa_id: controlling_record.fetch('resource').fetch('qsa_id_prefixed'),
                         display_string: controlling_record.fetch('resource').fetch('display_string'),
                       },
                       [controlling_record.dig('dates', 0, 'begin'), controlling_record.dig('dates', 0, 'end')].compact.join(' - '),
                       record['rap_applied'],
                       record['rap_expiration'])

    end

    task_blob = ClosedRecordRequest.new(user,
                                        agency,
                                        agency_request[:purpose],
                                        agency_request[:request_permission_to_copy] == 1 ? 'Yes' : 'No',
                                        requested_items).to_json

    add_task('agency_request', task_blob)
    add_task('agency_request_confirmation', task_blob)
  end

  def self.add_password_reset_notification_task(user_dto, host_service_url)
    auth = db[:dbauth][user_id: user_dto.fetch(:id)]
    token = auth[:recovery_token]
    expiry = auth[:recovery_token_expiry]

    task_blob = {
      user: user_dto,
      reset_url: "#{host_service_url}/recover-password/#{token}",
    }.to_json

    add_task('password_reset', task_blob)
  end

  def self.add_welcome_notification_tasks(user)
    task_blob = {
      user: user
    }.to_json

    add_task('welcome', task_blob)
  end

  def self.add_set_price_request_notification_task(generated_order_id, order_summary, user)
    add_task('set_price_request',
             {
               generated_order_id: generated_order_id,
               order_summary: order_summary,
               user: user,
             }.to_json)
  end
end