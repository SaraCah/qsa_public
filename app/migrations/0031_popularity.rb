Sequel.migration do
  up do
    alter_table(:reading_room_request) do
      add_index([:item_id], name: "rr_req_item_id_idx")
    end
  end
end
