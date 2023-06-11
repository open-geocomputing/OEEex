import js
import json
import ee
import types
import pyodide
import matplotlib.pyplot
import io
import base64
oeel_namespaceArray = []

consoleLog=print

def eePrint(toPrint):
	js.oeePrint(json.dumps({"answerType":"printConsole","type":"Print in CE console","value":toPrint}))

def eeMapOp(name,args):
	js.oeePrint(json.dumps({"answerType":"MapOperation","type":"CE Map operation","mapOp":name,"value":encodeFunctionArgs(args)}))

def displayPlt():
	buffer = io.BytesIO()
	matplotlib.pyplot.savefig(buffer, format='png')
	buffer.seek(0)
	encoded_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
	js.oeePrint(json.dumps({"answerType":"pyplotFigure","type":"Figure Pyplot","value":"data:image/png;base64,"+encoded_image}))

matplotlib.pyplot.show=displayPlt;

class Map():
	def __init__(self):
		self.functions = ["addLayer","setLocked","setControlVisibility","setCenter","setGestureHandling","setZoom","centerObject","setOptions","clear","style"];

	def __getattr__(self, name):
		def method(*args, **kwargs):
			eeMapOp(name,args)
		return method


def encodeInput(inputVal):
	if(isinstance(inputVal, types.FunctionType)):
		raise NotImplementedError("This function has not been implemented yet due to the Async nature of JavaScript.");
		# return {'type':'function','value':id(inputVal)}
	if(isinstance(inputVal, ee.computedobject.ComputedObject)):
		return {'type':'ee','ee_type':inputVal.name(),'value':json.dumps(ee.serializer.encode(inputVal))};
	return {'type':'other','value':json.dumps(ee.serializer.encode(inputVal))};

def decodeInput(inputVal):
	if(inputVal['type']=='function'):
		return generateFunction(inputVal)
	if(inputVal['type']=='ee'):
		return getattr(ee,inputVal['ee_type'])(ee.deserializer.fromJSON(inputVal["value"]));
	return ee.deserializer.fromJSON(inputVal["value"]);

def encodeFunctionArgs(args):
	if len(args)==1 and isinstance(args[0],dict): # and !isinstance(args[0], ee.computedobject.ComputedObject):
		return {key: encodeInput(value) for key, value in args[0]};
	else:
		return [encodeInput(value) for value in args];

def loadModule(string,name):
	code_block = compile(string, '<string>', 'exec')
	idVal=len(oeel_namespaceArray);
	oeel_namespaceArray.append({})
	exec(code_block, oeel_namespaceArray[idVal])
	oeel_namespaceArray[idVal]["__builtins__"]["consoleLog"]=consoleLog;
	oeel_namespaceArray[idVal]["__builtins__"]["print"]=eePrint;
	oeel_namespaceArray[idVal]["__builtins__"]["Map"]=Map();
	oeel_namespaceArray[idVal]["__builtins__"]["ee"]=ee;
	return json.dumps({"pyId":idVal,"id":":\"{}\"".format(name), "answerType":"moduleLoaded","type":"Python Module", "functions":list(filter(lambda x: x!="__builtins__", oeel_namespaceArray[idVal].keys()))})

def callFunction(idVal,name,args):
	func = oeel_namespaceArray[idVal][name];
	args=args.to_py();
	
	if type(args) is list: # Python's built-in array type is called list
		r=func(*[decodeInput(value) for value in args])
	elif type(args) is dict: # Python's built-in dictionary type is called dict
		r=func(**{key: decodeInput(value) for key, value in args})
	else:
		r=func(args)
	
	r=encodeInput(r)
	r["answerType"]="functionResult";
	return json.dumps(r);
