require 'rubygems'
require 'sinatra'
require 'nokogiri'
require 'sinatra/cross_origin'
require 'json'

@@location = %(<location-info><Point xmlns="http://www.opengis.net/gml" srsName="urn:ogc:def:crs:EPSG::4326"><pos>47.48516573 -109.5327</pos></Point></location-info>) #default location
@@jcard_uploaded = ''
set :port, 443
set :bind, '0.0.0.0'

configure do
  enable :cross_origin
end

before do
  response.headers['Access-Control-Allow-Origin'] = '*'
end

helpers do
  def protected!
    return if authorized?

    headers['WWW-Authenticate'] = 'Basic realm="Restricted Area"'
    halt 401, "Not authorized\n"
  end

  def authorized?
    @auth ||=  Rack::Auth::Basic::Request.new(request.env)
    puts @auth.provided?
    @auth.provided? and @auth.basic? and @auth.credentials and @auth.credentials == ['admin', 'admin']
  end
end

get '/' do
  'geolocation http server for vatrp'
end

post '/vatrp/location' do
  protected!
  request.body.rewind
  @@location = request.body.read
end

get '/location' do
	content_type 'text/xml'
	location_response
end

post '/location' do
	content_type 'application/held+xml'
	request.body.rewind
	location_response
end

get '/contact' do
	content_type 'text/xml'
	'<?xml version="1.0" encoding="UTF-8"?><vcards xmlns="urn:ietf:params:xml:ns:vcard-4.0"><vcard><n><surname>Doe</surname><given>John</given><additional/><prefix></prefix><suffix/></n><fn><text>John Doe</text></fn><org><text>The MITRE Corporation</text></org><title><text>VATRP Development Team</text></title><tel><parameters><type><text>work</text><text>voice</text></type></parameters><uri>tel:+1-123-456-7890</uri></tel><email><text>jdoe@domain.com</text></email></vcard></vcards>'
end

get '/jcardcontact' do
	content_type :json
	["vcard",
		[
			["version", {}, "text", "4.0"],
			["fn", {}, "text", "Simon Perreault"],
			["tel",
				{ "type": ["home"], "pref": "1" },
				"uri",
				"tel:+1-418-656-9254;ext=102"
			],
		    ["tel",
				{ "type": ["work", "cell"] },
				"uri",
				"tel:+1-418-262-6501"
		    ]
		]
	].to_json
end

post '/uploadjcard' do
	request.body.rewind
	@@jcard_uploaded = request.body.read
end

get '/uploadedjcard' do
	content_type 'application/json'
	@@jcard_uploaded
end

options '*' do
  response.headers["Allow"] = "GET, PUT, POST, DELETE, OPTIONS"
  response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token"
  response.headers["Access-Control-Allow-Origin"] = "*"
  200
end

def location_response
%(<?xml version="1.0"?>
   <locationResponse xmlns="urn:ietf:params:xml:ns:geopriv:held">
     <locationUriSet expires="#{(DateTime.now + 1).iso8601}">
       <locationURI>http://34.195.20.144:433/location</locationURI>
     </locationUriSet>
     <presence xmlns="urn:ietf:params:xml:ns:pidf">
     <tuple id="b650sf789nd">
     <status>
      <geopriv xmlns="http://www.opengis.net/gml" xmlns:gbp="urn:ietf:params:xml:ns:pidf:geopriv10:basic-policy">
       #{@@location}
        <usage-rules>
          <gbp:retransmission-allowed>
            false</gbp:retransmission-allowed>
          <gbp:retention-expiry>#{(DateTime.now + 1).iso8601}</gbp:retention-expiry>
        </usage-rules>
        <method>Wiremap</method>
      </geopriv>
     </status>
     <timestamp>#{DateTime.now.iso8601}</timestamp>
     </tuple>
   </presence>
   </locationResponse>)
end
