import js
import json
import ee
import types
import pyodide
try:
	import matplotlib.pyplot
	withPlotly=True
except Exception as e:
	withPlotly=False

import io
import base64
oeel_namespaceArray = []

consoleLog=print

mappingFunction={};

class oeeRequire:
	__dict__=dict({});
	def __init__(self, path, d):
		self.__dict__.update(d)
		self.path=path;

	def __getattr__(self, name):
		if name in self.__dict__:
			return self.__dict__[name]
		else:
			raise AttributeError("No such attribute: " + name)

	def __setattr__(self, name, value):
		self.__dict__[name] = value

	def __delattr__(self, name):
		if name in self.__dict__:
			del self.__dict__[name]
		else:
			raise AttributeError("No such attribute: " + name)
	def __str__(self):
		return "requireJS: "+self.path;

class oeelChain:
	def __init__(self, attr_chain=[]):
		self.attr_chain = attr_chain

	def __getattr__(self, attr):
		return oeelChain(self.attr_chain + [attr])

	def __call__(self, *args, **kwargs):
		# Here you could call the function you want with the collected attributes and parameters
		if not kwargs:
			return ee_Js2Py(js.oeelCall(ee_Py2Js(self.attr_chain), ee_Py2Js([ee_Py2Js(value) for value in args])))
		else:
			return ee_Js2Py(js.oeelCall(ee_Py2Js(self.attr_chain), ee_Py2Js([{ee_Py2Js(value) for key, value in kwargs}])))
	
	def requireJS(self, path):
		return oeeRequire(path,{key:ee_Js2Py(value) for key, value in js.oeeRequireJS( ee_Py2Js(path)).to_py(depth=1).items()});


class eeExportModule:
	def __init__(self, attr_chain=[]):
		self.attr_chain = attr_chain

	def __getattr__(self, attr):
		return eeExportModule(self.attr_chain + [attr])

	def __call__(self, *args, **kwargs):
		# Here you could call the function you want with the collected attributes and parameters
		if not kwargs:
			val=js.oeelExport(ee_Py2Js(self.attr_chain), ee_Py2Js([ee_Py2Js(value) for value in args]))
		else:
			val=js.oeelExport(ee_Py2Js(self.attr_chain), ee_Py2Js([{ee_Py2Js(value) for key, value in kwargs}]))
		class eeTask:
			def status(self):
				return {'state':'UNKNOWN'}
			def start(self):
				print("Nice try!👏")
			def __str__(self):
				return "Dummy class for expoterd task"
		return eeTask();

class eeDataModule:
	def __init__(self, attr_chain=[]):
		self.attr_chain = attr_chain

	def __getattr__(self, attr):
		class eeDataFucntion:
			def __init__(self, dataFunction):
				self.dataFunction=dataFunction;
			def __call__(self, *args, **kwargs):
				if not kwargs:
					return ee_Js2Py(js.oeelData(ee_Py2Js(self.dataFunction), ee_Py2Js([ee_Py2Js(value) for value in args])))
				else:
					return ee_Js2Py(js.oeelData(ee_Py2Js(self.dataFunction), ee_Py2Js([{ee_Py2Js(value) for key, value in kwargs}])))
			def __str__(self):
				return "ee.data."+self.dataFunction
		return eeDataFucntion(attr);

	def __str__(self):
		return "Dummy class for ee.data"

	
	

ee.batch.Export=eeExportModule();
ee.data=eeDataModule();

def eePrint(toPrint):
	if(hasattr(toPrint, '__str__')):
		js.oeePrint(str(toPrint))
	else:
		js.oeePrint(ee_Py2Js(toPrint));

def eeMapOp(name,args):
	js.oeeMap(name, ee_Py2Js([ee_Py2Js(value) for value in args]))
if withPlotly:
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
	oeel_namespaceArray[idVal]["__builtins__"]["oeel"]=oeelChain();
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
		def wrapper(*args,**kwargs):
			if not kwargs:
				return js.callJSFucntion(val,ee_Py2Js([ee_Py2Js(value) for value in args]));
			else:
				return js.callJSFucntion(val,ee_Py2Js([{key:ee_Py2Js(value) for key, value in kwargs.items()}]));
		return wrapper;
	return val.to_py();


def ee_Py2Js(val):
	if isinstance(val, ee.computedobject.ComputedObject):
		#EE object
		return js.oeeAsEEJS(ee.serializer.encode(val),val.name());
	if isinstance(val, (types.FunctionType, types.BuiltinFunctionType, types.MethodType, types.LambdaType, types.GeneratorType)):
		raise NotImplementedError("Unsupported Feature: Python function from JS not supported!")
		#return getJsCallable(val)
	return js.oeeAsJS(val)

def getJsCallable(fun):
	idVal=id(fun)
	mappingFunction[idVal]=fun;
	return js.oeelGetJsCallable(idVal)

def listPkgsInstalled():
	import micropip
	return ee_Py2Js(list(micropip.list()));

async def installPackage(pkgs):
	import micropip
	await micropip.install(ee_Js2Py(pkgs))

def callFunction(idVal,name,args):
	func = oeel_namespaceArray[idVal][name];
	args=args.to_py(depth=1);
	
	if type(args) is list: # Python's built-in array type is called list
		r=func(*[ee_Js2Py(value) for value in args])
	elif type(args) is dict: # Python's built-in dictionary type is called dict
		r=func(**{key: ee_Js2Py(value) for key, value in args.items()})
	else:
		r=func(args)

	return {"answerType":"functionResult", "value":ee_Py2Js(r)};

def callFunc(pyFucntionID,args):#inlined
	args=args.to_py(depth=1);
	func=mappingFunction[pyFucntionID];
	
	if type(args) is list: # Python's built-in array type is called list
		return func(*[ee_Js2Py(value) for value in args])
	elif type(args) is dict: # Python's built-in dictionary type is called dict
		return func(**{key: ee_Js2Py(value) for key, value in args.items()})
	else:
		return func(args)
