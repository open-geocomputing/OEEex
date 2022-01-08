#!/usr/bin/env python3
import os
from GEE_API_server import GEE_Handler, GEE_server
from checkAcces import GEE_checkAsset

PORT = 47850
server_address = ("", PORT)

server = GEE_server
handler = GEE_Handler;
print("Serveur actif sur le port :", PORT)

httpd = server(server_address, handler,{'/checkAcces':GEE_checkAsset(os.environ['GEE_API_ADDRESS'],'../gee-api-key.json')})
httpd.serve_forever()