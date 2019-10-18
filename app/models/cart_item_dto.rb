class CartItemDTO
  include DTO

  define_field(:id, Integer)
  define_field(:digital_copy_type, String, required: false)
  define_field(:digital_copy_delivery, String, required: false)
  define_field(:digital_copy_format, String, required: false)
  define_field(:digital_copy_resolution, String, required: false)
  define_field(:digital_copy_mode, String, required: false)
  define_field(:digital_copy_size, String, required: false)
  define_field(:digital_copy_notes, String, required: false)

  def self.from_row(row)
    new(id: row[:id],
        digital_copy_type: row[:digital_copy_type],
        digital_copy_delivery: row[:digital_copy_delivery],
        digital_copy_format: row[:digital_copy_format],
        digital_copy_resolution: row[:digital_copy_resolution],
        digital_copy_mode: row[:digital_copy_mode],
        digital_copy_size: row[:digital_copy_size],
        digital_copy_notes: row[:digital_copy_notes])
  end
end
