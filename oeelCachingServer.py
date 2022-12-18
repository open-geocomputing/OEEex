#!/usr/bin/env python3.9
import http.server
from http.server import SimpleHTTPRequestHandler
import os
import json
import ssl

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header("Access-Control-Allow-Methods", "POST,GET,OPTIONS, PUT, DELETE")
#header.Add("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, x-xsrf-token, Authorization")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        # self.send_header('Access-Control-Allow-Origin', '*')
        # self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        # self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        # self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if "/OpenEarthEngineLibrary/" in self.path:
            self.serverOEEL_File();
            return
        
        self.send_error(404, "File not found")
        return
        
    def serverOEEL_File(self):
        try:
            path = self.translate_path(self.path)
            with open(path,'r') as f:
                lines = f.read()
                jsonEcodedFile=json.JSONEncoder().encode(lines);
                fs = os.fstat(f.fileno())
        except IOError:
            self.send_error(404, "File not found")
            return
        self.send_response(200)
        self.send_header("Content-type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(jsonEcodedFile))
        self.send_header("cache-control", "max-age="+str(3600))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()
        self.wfile.write(jsonEcodedFile.encode('utf-8'));
        


 
PORT = 47849
server_address = ("", PORT)

server = http.server.ThreadingHTTPServer
handler = CORSRequestHandler
print("Serveur actif sur le port :", PORT)

httpd = server(server_address, handler)
httpd.socket = ssl.wrap_socket (httpd.socket,
        keyfile="../ssl/privkey.pem",
        certfile='../ssl/fullchain.pem', server_side=True)
httpd.serve_forever()
