class OAIHelpers

  def self.format_identifier(uri)
    ['oai', AppConfig[:oai_repository_identifier], uri].join(':')
  end

end
