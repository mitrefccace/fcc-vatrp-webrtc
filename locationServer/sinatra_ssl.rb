require 'webrick/ssl'

module Sinatra
	class Application
		def self.run!
			certificate_content = File.open('/etc/ssl/cert.pem')
			key_content = File.open('/etc/ssl/key.pem').read
			
			server_options = {
				:Host => '0.0.0.0',
				:Port => 443,
				:SSLEnable => true,
				:SSLCertificate => OpenSSL::X509::Certificate.new(certificate_content),
				:SSLPrivateKey => OpenSSL::PKey::RSA.new(key_content,"123456"),
				:SSLVerifyClient => OpenSSL::SSL::VERIFY_NONE
			}
			Rack::Handler::WEBrick.run self, server_options do |server|
				[:INT, :TERM].each { |sig| trap(sig) { server.stop } }
				server.threaded = settings.threaded if server.respond_to? :threaded=
				set :running, true
			end
		end
	end
end
