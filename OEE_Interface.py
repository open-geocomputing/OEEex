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
	js.oeePrint(ee_Py2Js(toPrint));

def eeMapOp(name,args):
	js.oeeMap(name, ee_Py2Js([ee_Py2Js(value) for value in args]))

def displayPlt():
	buffer = io.BytesIO()
	matplotlib.pyplot.savefig(buffer, format='png')
	buffer.seek(0)
	encoded_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
	js.oeePlot("data:image/png;base64,"+encoded_image);

matplotlib.pyplot.show=displayPlt;

class Map():
	def __init__(self):
		self.functions = ["addLayer","setLocked","setControlVisibility","setCenter","setGestureHandling","setZoom","centerObject","setOptions","clear","style"];

	def __getattr__(self, name):
		def method(*args, **kwargs):
			eeMapOp(name,args)
		return method

def loadModule(string,name):
	code_block = compile(string, '<string>', 'exec')
	idVal=len(oeel_namespaceArray);
	oeel_namespaceArray.append({})
	exec(code_block, oeel_namespaceArray[idVal])
	oeel_namespaceArray[idVal]["__builtins__"]["consoleLog"]=consoleLog;
	oeel_namespaceArray[idVal]["__builtins__"]["print"]=eePrint;
	oeel_namespaceArray[idVal]["__builtins__"]["Map"]=Map();
	oeel_namespaceArray[idVal]["__builtins__"]["ee"]=ee;
	return {"pyId":idVal,"id":":\"{}\"".format(name), "answerType":"moduleLoaded","type":"Python Module", "functions":list(filter(lambda x: x!="__builtins__", oeel_namespaceArray[idVal].keys()))};

def isEEObject(val):
	return js.oeeIsEE(val);

def EEtype(val):
	return js.oeeEEtype(val);

def isJSFunction(val):
	return js.oeeIsFunction(val);

def ee_Js2Py(val):
	if isEEObject(val):
		return getattr(ee,EEtype(val))(ee.deserializer.decode(js.oeeEncodeEE(val).to_py()));
	if isJSFunction(val):
		def wrapper(*args,**kargs):
			if(len(args)>0):
				return js.callJSFucntion(val,ee_Py2Js([ee_Py2Js(value) for value in args]));
			else:
				return js.callJSFucntion(val,ee_Py2Js([{ee_Py2Js(value) for key, value in kargs}]));
		return wrapper;
	return val.to_py();

def ee_Py2Js(val):
	if isinstance(val, ee.computedobject.ComputedObject):
		return js.oeeAsEEJS(ee.serializer.encode(val),val.name());
	return js.oeeAsJS(val)


def callFunction(idVal,name,args):
	func = oeel_namespaceArray[idVal][name];
	args=args.to_py(depth=1);
	
	if type(args) is list: # Python's built-in array type is called list
		r=func(*[ee_Js2Py(value) for value in args])
	elif type(args) is dict: # Python's built-in dictionary type is called dict
		r=func(**{key: ee_Js2Py(value) for key, value in args})
	else:
		r=func(args)

	return {"answerType":"functionResult", "value":ee_Py2Js(r)};
