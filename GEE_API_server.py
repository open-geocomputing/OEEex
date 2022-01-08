import http.server
from http.server import SimpleHTTPRequestHandler
import os
import json
from urllib.parse import urlparse, parse_qs


class GEE_Handler (SimpleHTTPRequestHandler):
    dictionaryApp={};
    def __init__(self, request, client_address, server):
        self.dictionaryApp=server.dictionaryApp;
        super(GEE_Handler, self).__init__(request, client_address, server)

    def setDictionaryApp(self,dictionaryApp):
        self.dictionaryApp=dictionaryApp;
        print(self.dictionaryApp)

    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header("Access-Control-Allow-Methods", "POST,GET,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Accept, Content-Type")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_GET(self):
        parsedUrl=urlparse(self.path);
        queryDic = parse_qs(parsedUrl.query)
        obj={}
        for key in queryDic.keys():
        	obj[key]=json.JSONDecoder().decode(queryDic[key][0]);
        self.GEE_service(parsedUrl.path, queryDic,'GET');

    def do_POST(self):
        parsedUrl=urlparse(self.path);
        length = int(self.headers['Content-Length']);
        field_data = self.rfile.read(length);
        queryDic = parse_qs(field_data.decode('utf-8'));
        obj={}
        for key in queryDic.keys():
            obj[key]=json.JSONDecoder().decode(queryDic[key][0]);
        self.GEE_service(parsedUrl.path, obj,'POST');

    def GEE_service(self,service, queryDic, requestType):
        status=404
        hearders={}
        val='';
        if(service in self.dictionaryApp.keys()):
            status,hearders,val=self.dictionaryApp[service].singleRequest(queryDic,requestType)        
        self.send_response(status)
        self.end_headers()
        for key in hearders.keys():
            try:
                self.send_header(key, hearders[key]);
                pass
            except Exception as e:
                print(e);
        self.wfile.write(val.encode('utf-8'))

class GEE_server (http.server.HTTPServer):
    def __init__(self, server_address, RequestHandlerClass, dictionaryApp):
        super(GEE_server, self).__init__(server_address, RequestHandlerClass)
        self.dictionaryApp=dictionaryApp;

class GEE_Service():

  def __init__(self,service_account, apiKeyFile ):
    super(GEE_Service, self).__init__()
    import ee 
    credentials = ee.ServiceAccountCredentials(service_account, apiKeyFile)
    ee.Initialize(credentials)
    self.ee=ee
