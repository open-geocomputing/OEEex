import math
import cgi
form = cgi.FieldStorage()
import json
import datetime
import os
import asyncio

from GEE_API_server import GEE_Service

def printErrorMessage(task_id,errorMessage,adviceMessage='Double check the inputs'):
    return (400,{"Content-type":"application/json"},json.JSONEncoder().encode({'status':'error','taskID':task_id,'errorMesage':errorMessage,'advice':adviceMessage}));

class GEE_checkAsset(GEE_Service):

  def singleRequest(self, form, requestType):
    timeStamp=math.floor(datetime.datetime.utcnow().timestamp());
    with open("logs/{}.log".format(timeStamp), 'w') as f:
      f.write(json.JSONEncoder().encode(form))
    if('assetIDs' not in form.keys() and 'filePath' not in form.keys() ):
      return printErrorMessage(timeStamp,'assetIDs list or filePath is mendatory!')

    if('filePath' in form.keys()):
      filePath=form["filePath"][0]

    if('assetIDs' in form.keys()):
      assetsIDs=form["assetIDs"];
      try:
        def checkForAsset(result,key):
          try:
            val=self.ee.data.getAsset(key);
            result[key]=True;
          except:
            result[key]=False;

        def checkAll(assetsIDs):
          result={};
          [checkForAsset(result,assetsID) for assetsID in assetsIDs];
          return result;

        result=checkAll(assetsIDs);

        return (200,{"Content-type":"application/json"},json.JSONEncoder().encode(result));
      except Exception as e:
        return printErrorMessage(timeStamp,str(e));

    return printErrorMessage(timeStamp,'no computation');
