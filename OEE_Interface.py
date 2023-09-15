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
		sourceCode=js.oeeRequireJS( ee_Py2Js(path))
		js_output=pyodide.code.run_js("(function(){var exports={};" +sourceCode+"\n return exports})()");
		return oeeRequire(path,{key:ee_Js2Py(value) for key, value in js_output.to_py(depth=1).items() });

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

import os

import sys

class EEimpport():
	def __init__(self):
		self.struct={"users":{}}
		os.makedirs("users", exist_ok=True);
		pass

	def decodePathAdd(self,soruceTree,treeToAdd,path):
		for key,value in soruceTree.items():
			if(isinstance(value,dict)):
				treeToAdd[key]={};
				self.decodePathAdd(soruceTree[key],treeToAdd[key],path+"/"+key);
			else:
				treeToAdd[key.rstrip(".py")]=path+"/"+key;

	def getEEPath(self,path,obj=None,currentPath=""):
		if obj==None:
			obj=self.struct;
		splitPath=path.split(".",1)
		if(splitPath[0] in obj):
			if(len(splitPath)>1):
				propagated=self.getEEPath(splitPath[1],obj[splitPath[0]],currentPath+"/"+splitPath[0]);
				return propagated;#splitPath[0]+"/"+propagated if isinstance(propagated,str) else propagated;
			else:
				if('__init__' in obj[splitPath[0]]):
					return obj[splitPath[0]]['__init__'];
				else:
					return obj[splitPath[0]];
		else:
			result=ee_Js2Py(js.importPakageStruct(currentPath.lstrip("/")+"/"+splitPath[0]))
			obj[splitPath[0]]={}
			self.decodePathAdd(result["tree"],obj[splitPath[0]],currentPath+"/"+splitPath[0]+":");
			return None;

	def find_module(self, fullname, path=None):
		fullNameAsPath=fullname.replace('.',"/")
		if fullname.startswith("users") and not (os.path.exists(fullNameAsPath) or os.path.exists(fullNameAsPath+'.py')):
			downloadPath=self.getEEPath(fullname);
			if(isinstance(downloadPath,str)):
				downloadPath=downloadPath.lstrip("/")
				code=js.importCode(downloadPath)
				pathStore=downloadPath.replace(":","");
				os.makedirs(os.path.dirname(pathStore), exist_ok=True);
				with open(pathStore, 'w') as file:
					file.write(code);
			else:
				os.makedirs(fullNameAsPath, exist_ok=True);
				self.find_module(fullname, path)

	def load_module(self, fullname):
		pass


EEimpportModule=EEimpport();
sys.meta_path.insert(0,EEimpportModule)

def installDictionaryAtPath(obj,path):
	os.makedirs(path, exist_ok=True);
	for key, value in obj.items():
		if(isinstance(value,dict)):
			installDictionaryAtPath(value,path+key+'/')
		else:
			with open(path+key, 'w') as file:
				file.write(value);

def installPackageFromObject(obj,path):
	shortPath=path.split(":", 1)[1]
	path=path.replace(":", "/");
	installDictionaryAtPath(ee_Js2Py(obj),path+'/')
	os.symlink(path, shortPath);

def eePrint(*toPrints):
	toPrints=list(toPrints)
	for ix in range(len(toPrints)):
		if(isinstance(toPrints[ix], ee.computedobject.ComputedObject)):
			toPrints[ix]=ee_Py2Js(toPrints[ix]);
		elif(hasattr(toPrints[ix], '__str__')):
			toPrints[ix]=str(toPrints[ix]);
		else:
			toPrints[ix]=ee_Py2Js(toPrints[ix]);
	js.oeePrint(ee_Py2Js(toPrints))

def eeMapOp(name,args):
	js.oeeMap(name, ee_Py2Js([ee_Py2Js(value) for value in args]))
if withPlotly:
	def displayPlt(bbox_inches="tight", dpi=100):
		buffer = io.BytesIO()
		matplotlib.pyplot.savefig(buffer, format='png',bbox_inches=bbox_inches,dpi=dpi)
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
	exec(compile("", '<string>', 'exec'), oeel_namespaceArray[idVal])
	oeel_namespaceArray[idVal]["__builtins__"]["consoleLog"]=consoleLog;
	oeel_namespaceArray[idVal]["__builtins__"]["print"]=eePrint;
	oeel_namespaceArray[idVal]["__builtins__"]["Map"]=Map();
	oeel_namespaceArray[idVal]["__builtins__"]["ee"]=ee;
	oeel_namespaceArray[idVal]["__builtins__"]["oeel"]=oeelChain();
	oeel_namespaceArray[idVal]["__name__"]=name;
	exec(code_block, oeel_namespaceArray[idVal])
	return {"pyId":idVal,"id":":\"{}\"".format(name), "answerType":"moduleLoaded","type":"Python Module", "functions":list(filter(lambda x: not(x.startswith("__") and x.endswith("__")), oeel_namespaceArray[idVal].keys()))};

def run(string,dataset):
	dataset=dataset.to_py(depth=1);
	dataset={key: ee_Js2Py(value) for key, value in dataset.items()};
	code_block = compile(string, '<string>', 'exec')
	exec(compile("", '<string>', 'exec'), dataset)
	dataset["__builtins__"]["consoleLog"]=consoleLog;
	dataset["__builtins__"]["print"]=eePrint;
	dataset["__builtins__"]["Map"]=Map();
	dataset["__builtins__"]["ee"]=ee;
	dataset["__builtins__"]["oeel"]=oeelChain();
	dataset["__name__"]="__main__";
	exec(code_block, dataset)
	return {"answerType":"run","type":"Python single run"};
	

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
