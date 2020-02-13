# create database qsa_public character set UTF8mb4 collate utf8mb4_bin;
# grant all on qsa_public.* to 'qsa'@'localhost' identified by 'qsa123';

AppConfig[:db_url] = "jdbc:mysql://localhost:3306/qsa_public?useUnicode=true&characterEncoding=UTF-8&user=sara&password=hannah&serverTimezone=UTC&useSSL=false"

AppConfig[:session_secret] = "randomly_generated_token"

AppConfig[:minicart_base_url] = 'https://test.smartservice.qld.gov.au'
AppConfig[:minicart_wsdl] = AppConfig[:minicart_base_url] + '/payment/schemas/shopping_cart_1_3.wsdl'
AppConfig[:minicart_user] = 'qsa'
AppConfig[:minicart_password] = 'eyJfI1itiBuZ'
AppConfig[:minicart_endpoint] = AppConfig[:minicart_base_url] + '/payment/service'
AppConfig[:minicart_service_name] = "Queensland State Archives"
AppConfig[:minicart_disbursement_id] = 1
AppConfig[:minicart_base_order_id] = 0

AppConfig[:minicart_css_url] = "#{AppConfig[:minicart_base_url]}/payment/ui/minicart_1.0.css"
AppConfig[:minicart_contents_url] = "#{AppConfig[:minicart_base_url]}/payment/minicart/contents_1.0.js"
AppConfig[:minicart_script_url] = "#{AppConfig[:minicart_base_url]}/payment/ui/minicart_1.0.js"


AppConfig[:recaptcha_enabled] = false
AppConfig[:recaptcha_url] = 'https://www.google.com/recaptcha/api.js'
AppConfig[:recaptcha_params] = '?onload=captchaOnLoad&render=explicit'
AppConfig[:recaptcha_verify_url] = 'https://www.google.com/recaptcha/api/siteverify'
AppConfig[:recaptcha_site_key] = '6LcM2sAUAAAAACqF0u5IqK26jdiCrstC0zI0hTNb'
AppConfig[:recaptcha_secret_key] = '6LcM2sAUAAAAADuNDvoXCaiy_vWygZ-gD5Iu22JU'
AppConfig[:indexer_interval_seconds] = 5
AppConfig[:solr_url] = "http://localhost:9384/solr/qsapublic/"
AppConfig[:solr_indexer_state_file] = File.join(File.dirname(__FILE__), "..", "data/solr_indexer_state.dat")
AppConfig[:page_size] = 10

# As a long term average you can try one login every 10 seconds
AppConfig[:dbauth_seconds_per_login] = 10

# But you can try 10 in quick succession before we start limiting
AppConfig[:dbauth_max_login_burst] = 10

AppConfig[:oai_repository_url] = 'http://dishevelled.net:3333/oai'
AppConfig[:qsa_public_base_url] = 'http://localhost:3009'
AppConfig[:oai_repository_name] = 'Queensland State Archives'
AppConfig[:oai_contact_email] = 'mark@dishevelled.net'
AppConfig[:oai_repository_identifier] = 'archives.qld.gov.au'
AppConfig[:oai_sample_identifier] = proc {
  ['oai', AppConfig[:oai_repository_identifier], '/repositories/2/resources/1'].join(':')
}


# FIXME: Disable this in production
AppConfig[:enable_debug_cart_endpoint] = true

AppConfig[:page_content_cache_seconds] = 30

begin
  load File.join(File.dirname(__FILE__), "/config.local.rb")
rescue LoadError
end