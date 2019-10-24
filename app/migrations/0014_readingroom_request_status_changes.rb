Sequel.migration do
  up do
    self[:reading_room_request].filter(:status => 'IN_RETRIEVAL').update(:status => 'BEING_RETRIEVED')
    self[:reading_room_request].filter(:status => 'READY_FOR_RETRIEVAL').update(:status => 'DELIVERED_TO_READING_ROOM')
    self[:reading_room_request].filter(:status => 'WITH_RESEARCHER').update(:status => 'DELIVERED_TO_READING_ROOM')
    self[:reading_room_request].filter(:status => 'RETURNED_BY_RESEARCHER').update(:status => 'DELIVERED_TO_READING_ROOM')
  end
end
