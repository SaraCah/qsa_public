class QSAPublic < Sinatra::Base

  STATIC_DIR = File.realpath(File.absolute_path(File.join(File.dirname(__FILE__), '..', 'static')))

  get '/*' do
    if request.path == '/'
      send_file(File.join(STATIC_DIR, 'index.html'))
    else
      requested_file = begin
                         File.realpath(File.absolute_path(File.join(STATIC_DIR, request.path)))
                       rescue Errno::ENOENT
                         ""
                       end

      if requested_file.start_with?(STATIC_DIR) && File.exist?(requested_file)
        if request.path =~ /\.[a-f0-9]{8}\./
          # Cache built assets more aggressively
          headers('Cache-Control' => "max-age=86400, public",
                  'Expires' => (Time.now + 86400).utc.rfc2822)
        end

        send_file requested_file
      else
        send_file(File.join(STATIC_DIR, 'index.html'))
      end
    end
  end

end
