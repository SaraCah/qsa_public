require 'net/http'

class Recaptcha

  def self.verify_token(token)
    recaptcha_uri = URI(AppConfig[:recaptcha_verify_url])
    params = {
      :secret => AppConfig[:recaptcha_secret_key],
      :response => token,
    }

    response = Net::HTTP.post_form(recaptcha_uri, params)

    if response.code == '200'
      json = JSON.parse(response.body)
      if json['success']
        []
      else
        json['error-codes'].map do |code|
          {
            code: 'RECAPTCHA_ERROR',
            value: code,
          }
        end
      end
    else
      [{code: 'RECAPTCHA_ERROR', value: 'Unable to verify token'}]
    end
  end

end