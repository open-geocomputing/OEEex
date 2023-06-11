var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

const consolePythonCEExtensionPrefix='OEEex_AddonPythonCE';

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

function oeePrint(toPrint){
	if(currentInputUsed){
		currentInputUsed.value=toPrint;
		currentInputUsed.dispatchEvent(new Event('change'));
	}else{
		console.log(JSON.parse(toPrint));
	}
}

function oeeComputeValue(obj){
	let val= ee.data.computeValue(ee.Deserializer.fromJSON(obj));
	return val;
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

function loadConsolePythonCEWatcher(){
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){

		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if (e.classList){
					if(e.classList.contains('OEEexPythonCEAnalysis'))
						return;
					e.classList.add('OEEexPythonCEAnalysis')
					analysisPythonCEAddon(e)
				}
			});
		});
	});
	let obsConfig = { childList: true};
	
	if(document.querySelector('ee-console'))
		myObserver.observe(document.querySelector('ee-console'), obsConfig);
}

function editorModeWatcher(){

	
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){
		let newName=false;
		for (var i = 0; i < mutList.length; i++) {
			if(mutList[i].addedNodes.length>0)
				newName=mutList[i].addedNodes[0].textContent;
		}
		if(newName){
			var editorElement=document.getElementsByClassName('ace_editor')
			if(editorElement && editorElement.length>0){
				editorElement[0].id='editor'
				var editor = ace.edit("editor");
			}
			editor.session.setMode(newName.includes(".py")?"ace/mode/python":"ace/mode/javascript");
		}
	});
	let obsConfig = { childList: true, characterData: true, subtree: true };;
	
	if(document.querySelector('.panel.editor-panel .header'))
		myObserver.observe(document.querySelector('.panel.editor-panel .header'), obsConfig);
}


// editorModeWatcher()

function analysisPythonCEAddon(val){
	val.querySelectorAll('.ui-widget.ui-textbox').forEach(function(obj){
		let input=obj.querySelector('input');
		if(input.placeholder=="OEEex_Active_AddonPythonCE"){
			obj.parentElement.style.display='none';
			runSendPython(input);
		}
	});
}

function runSendPython(inputElement){
	if(typeof pyoee == 'undefined' || typeof pyodide == 'undefined'){
		injectPythonCE();
		window.addEventListener('pyodideLoaded',function(){
			runSendPython(inputElement)
		});
		return;
	}
	currentInputUsed=inputElement;
	let jsInput=JSON.parse(inputElement.value);
	switch (jsInput.type) {
	case 'code':
		pyodide.runPythonAsync(jsInput.code)
		break;
	case 'functionCall':
		let functionResult=pyoee.callFunction(jsInput.pyId,jsInput.functionName,jsInput.arg);
		inputElement.value=functionResult;
		inputElement.dispatchEvent(new Event('change'))
		break;
	case 'loadModule':
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
		inputElement.value=lodingInfo;
		inputElement.dispatchEvent(new Event('change'))
		break;
	default:
		console.log(`Sorry ${jsInput.type} is unsuported.`);
	}

}

loadConsolePythonCEWatcher();
