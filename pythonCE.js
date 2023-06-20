var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

const consolePythonCEExtensionPrefix='OEEex_AddonPythonCE';
const promptPythonCEExtensionPrefix='OEEex_Active_AddonPythonCE';

if(typeof OEEexEscapeURL == 'undefined'){
	OEEexEscapeURL = trustedTypes.createPolicy("OEEexEscapeURL", {
		createScriptURL: (string, sink) => string
	});
}

if(typeof OEEexEscape == 'undefined'){
	OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
		createHTML: (string, sink) => string
	});
}

currentInputUsed=null;
EEContext=null;

function oeePrint(toPrint){
	if(EEContext){
		EEContext({answerType:"printConsole", value:toPrint})
	}else{
		console.log(toPrint);
	}
}

function oeeMap(eeMapOp,args){
	if(EEContext){
		EEContext({answerType:"MapOperation", mapOp:eeMapOp ,args:args})
	}
}

function oeePlot(imageString){
	if(EEContext){
		EEContext({answerType:"pyplotFigure",value:imageString})
	}
}



function oeeComputeValue(obj){
	let val= ee.data.computeValue(ee.Deserializer.fromJSON(obj));
	return val;
}

function oeeIsEE(obj){
	return obj instanceof ee.ComputedObject;
}

function oeeEncodeEE(obj){
	return ee.Serializer.encode(obj);
}

function oeeEEtype(obj){
	return obj.name();
}

function oeeAsEEJS(obj,type){
	return ee[type](ee.Deserializer.decode(obj.toJs({dict_converter: Object.fromEntries})))
}
function oeeAsJS(obj){
	if(obj instanceof pyodide.ffi.PyProxy )
		return obj.toJs({dict_converter: Object.fromEntries})
	return obj
}

function callJSFucntion(f,args){
	return f.apply(null,args)
}

function oeeIsFunction(obj){
	return obj instanceof Function;
}


function injectPythonCE(){
	window.dispatchEvent(new CustomEvent('pyodideLoading'));
	var s = document.createElement('script');
	s.src = OEEexEscapeURL.createScriptURL("https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js");
	s.onload = function() {
		loadPyodide().then(function(pyodideLoaded){
			pyodide=pyodideLoaded;
			pyodide.loadPackage("matplotlib").then(function(){
			pyodide.runPythonAsync(`
	from pyodide.http import pyfetch
	response = await pyfetch("chrome-extension://`+OEEexidString+`/earthengine-api.tar.gz")
	await response.unpack_archive()
	response2 = await pyfetch("chrome-extension://`+OEEexidString+`/OEE_Interface.py")
	with open("OEE_Interface.py", "wb") as f:
		f.write(await response2.bytes())
			`).then(function(){
				pyee=pyodide.pyimport("ee");
				console.log("ee charge in Py env")
				pyee.Initialize()
				console.log("ee is initialized")
				pyoee=pyodide.pyimport("OEE_Interface");
				console.log("OEE interface is initialized")
				window.dispatchEvent(new CustomEvent('pyodideLoaded'));
			})})
		})

		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
}

function requestAsEE(uri){
	const request = new XMLHttpRequest();
	request.open("GET", uri, false); // `false` makes the request synchronous
	
	request.setRequestHeader('Authorization', ee.data.getAuthToken());
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(null);

	if (request.status === 200) {
	  return request.responseText;
	}
	throw "Python init error"
}

function overloadPrompt(){
	let originalPrompt=prompt;
	prompt=function(code, inputVal){
		if(code==promptPythonCEExtensionPrefix){
			return runSendPython(inputVal);
		}
		return originalPrompt(code,inputVal)
	}
}

overloadPrompt();
injectPythonCE();
function runSendPython(inputVal){
	if(typeof pyoee == 'undefined' || typeof pyodide == 'undefined'){
		injectPythonCE();
		return {answerType:"error", message:"Wait that Python is loaded and re-run the code."};
	}

	//currentInputUsed=inputElement;
	let jsInput=inputVal;
	switch (jsInput.type) {
	case 'code':
		pyodide.runPythonAsync(jsInput.code)
		break;
	case 'functionCall':
		let functionResult=pyoee.callFunction(jsInput.pyId,jsInput.functionName,jsInput.arg);
		return  oeeAsJS(functionResult);
		break;
	case 'loadModule':
		EEContext=inputVal.context;

			// delete inputVal.context;
		let path=jsInput.path.split(":");
		let url="https://code.earthengine.google.com/repo/file/load?repo="+encodeURI(path[0])+"&path="+encodeURI(path[1]);

		const request = new XMLHttpRequest();
		request.open("GET", url, false); // `false` makes the request synchronous
		
		request.setRequestHeader('X-XSRF-Token',window._ee_flag_initialData.xsrfToken);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(null);

		if (request.status === 200) {
			sourceCode=JSON.parse(request.responseText);
		}

		let lodingInfo=pyoee.loadModule(sourceCode,jsInput.path)
		return oeeAsJS(lodingInfo);
		break;
	default:
		console.log(`Sorry ${jsInput.type} is unsuported.`);
	}

}
