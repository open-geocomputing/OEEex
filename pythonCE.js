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

function injectPythonCE(){
	var s = document.createElement('script');
	s.src = OEEexEscapeURL.createScriptURL("https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js");
	s.onload = function() {
		loadPyodide().then(function(pyodideLoaded){
			pyodide=pyodideLoaded;
			pyodide.runPythonAsync(`
	from pyodide.http import pyfetch
	response = await pyfetch("chrome-extension://`+OEEexidString+`/earthengine-api.tar.gz")
	await response.unpack_archive()
			`).then(function(){
				pyee=pyodide.pyimport("ee");
				console.log("ee charge in Py env")
			})
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

injectPythonCE();

