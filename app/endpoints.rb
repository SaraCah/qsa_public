class QSAPublic < Sinatra::Base

  Endpoint.get('/') do
      json_response(hello: "GREETINGS")
  end

end