class QSAPublic < Sinatra::Base

  Endpoint.get('/favicon.ico') do
    send_file File.absolute_path('favicon.ico')
  end

  Endpoint.get('/') do
    Templates.emit_with_layout(:home,
                               {},
                               :layout,
                               {
                                 title: "QSA Public"
                               })
  end

end