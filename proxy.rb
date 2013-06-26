require 'webrick' 
require 'webrick/httpproxy' 

s = WEBrick::HTTPProxyServer.new(:Port => 8080,
    :RequestCallback => Proc.new{|req,res| 
      puts req.request_line, req.raw_header
      req.header["host"] = "www.google.com"
      # debugger
    })

# Shutdown functionality
trap("INT"){s.shutdown}

# run the beast
s.start

# require 'webrick/httpproxy'
 
# def handle_request(req, res)
#   puts "[REQUEST] " + req.request_line
#   if req.host == "example.com" || req.host == "www.example.com"
#     res.header['content-type'] = 'text/html'
#     res.header.delete('content-encoding')
#     res.body = "Access is denied."
#   end
# end
 
# if $0 == __FILE__ then
#   server = WEBrick::HTTPProxyServer.new(
#     :Port => 8123,
#     :AccessLog => [],
#     :ProxyContentHandler => method(:handle_request))
#   trap "INT" do server.shutdown end
#   server.start
# end