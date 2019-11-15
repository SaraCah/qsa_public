Sequel.migration do
  up do
    self[:page].insert({
       slug: "search-help",
       locked: 1,
       deleted: 0,
       create_time: java.lang.System.currentTimeMillis,
       created_by: 'Admin user',
       content: ('<h1>Search help</h1>' +
         '<p>TBC</p>')
     })
  end
end
