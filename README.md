screen.js
=========

Client side screen recording library

ruby -rsocket -e 's=TCPServer.new(5**5);loop{_=s.accept;_<<"HTTP/1.0 200 OK\r\n\r\n#{File.read(_.gets.split[1])rescue nil}";_.close}'