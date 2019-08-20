require_relative 'main'

def app
  QSAPublic
end

map "/" do
  run QSAPublic
end
