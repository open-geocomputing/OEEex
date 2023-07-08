pyodideAvailablePackage=["asciitree","astropy","atomicwrites","attrs","autograd","bcrypt","beautifulsoup4","biopython","bitarray","bleach","bokeh","boost-histogram","brotli","cbor-diag","certifi","cffi","cffi_example","cftime","click","cligj","cloudpickle","cmyt","colorspacious","coverage","cramjam","cryptography","cssselect","cycler","cytoolz","decorator","demes","distlib","docutils","exceptiongroup","fastparquet","fiona","fonttools","freesasa","fsspec","future","galpy","gensim","geopandas","gmpy2","gsw","h5py","html5lib","idna","imageio","iniconfig","jedi","Jinja2","joblib","jsonschema","kiwisolver","lazy-object-proxy","lightgbm","logbook","lxml","MarkupSafe","matplotlib","matplotlib-pyodide","micropip","mne","more-itertools","mpmath","msgpack","msprime","multidict","munch","mypy","networkx","newick","nlopt","nltk","nose","numcodecs","numpy","opencv-python","optlang","packaging","pandas","parso","patsy","Pillow","pillow_heif","pkgconfig","pluggy","py","pyb2d","pyclipper","pycparser","pycryptodome","pydantic","pyerfa","Pygments","pyheif","pyinstrument","pynacl","pyodide-http","pyparsing","pyproj","pyrsistent","pytest","pytest-benchmark","python-dateutil","python-magic","python-sat","python_solvespace","pytz","pywavelets","pyxel","pyyaml","rebound","reboundx","regex","retrying","RobotRaconteur","ruamel.yaml","scikit-image","scikit-learn","scipy","setuptools","shapely","six","smart_open","soupsieve","sparseqr","sqlalchemy","statsmodels","svgwrite","swiglpk","sympy","tblib","termcolor","threadpoolctl","tomli","tomli-w","toolz","tqdm","traits","tskit","typing-extensions","uncertainties","unyt","webencodings","wordcloud","wrapt","xarray","xgboost","xlrd","yarl","yt","zarr"];

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

// add pythonLogo


function addPythonLogo(){
	let rootElement=document.querySelector('.goog-splitpane-second-container ee-tab-panel').shadowRoot;

	var sheet = new CSSStyleSheet
	sheet.replaceSync( `.header img.pytLogo { float: right; width: 19px; padding: 2px 6px; filter: drop-shadow(0px 0px 3px white); }
						.header img.pytLogo.disabled { filter: grayscale(1); }
						.header img.pytLogo {  }
						@keyframes colorToGrayPyLogo {
							0% { filter: grayscale(100%); }
							50% { filter: drop-shadow(0px 0px 3px white); }
							100% { filter: grayscale(100%); }
						}
						@keyframes rotatePyLogo {
							0% { transform: rotate(0deg); }
							100% { transform: rotate(360deg); }
						}
						.header img.pytLogo.loading {
							/*animation: colorToGrayPyLogo 0.1s infinite;*/
							animation: rotatePyLogo 2s linear infinite;
							filter: drop-shadow(0px 0px 3px white) grayscale(66%);
						}
						.header img.pytLogo.running {
							animation: rotatePyLogo 1s linear infinite;
						}`)
	// Append your style to the existing style sheet.
	rootElement.adoptedStyleSheets=[...rootElement.adoptedStyleSheets,sheet];

	let newImg = document.createElement('img');
	newImg.classList.add("pytLogo","disabled")
	newImg.src="chrome-extension://"+OEEexidString+"/images/pyLogo.svg"
	rootElement.querySelector('.header').appendChild(newImg);

	window.addEventListener("startPython",function(){newImg.classList.add("running");});
	window.addEventListener("stopPython",function(){newImg.classList.remove("running");});

	window.addEventListener("pyodideLoading",function(){
		newImg.classList.add("loading");
		newImg.classList.remove("disabled");
	})
	window.addEventListener("pyodideLoaded",function(){
		newImg.classList.remove("loading");
	})
}

addPythonLogo();

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

function oeelExport(path,args){
	let f=playground.api.Export;
	for (var i = 0; i < path.length; i++) {
		f=f[path[i]];
	}
	f.apply(null,args);
}

function oeelData(dataFunction,args){
	let f=ee.data[dataFunction];
	return f.apply(null,args);
}


function oeelCall(path, args){
	if(EEContext){
		return EEContext({answerType:"oeelCall", path:path ,args:args})
	}
	else{
		throw "Error oeel not available. This error should not be possible :)"
	}
}

function oeeRequireJS(path){
	return oeeRequire(path)
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

function oeelGetJsCallable(funcID){
	return function(){
		console.log(arguments)
		return pyoee.callFunc(funcID)
	}
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
	let start = Date.now();
	window.dispatchEvent(new CustomEvent('pyodideLoading'));
	var s = document.createElement('script');
	s.src = OEEexEscapeURL.createScriptURL("https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js");
	s.onload = function() {
		loadPyodide().then(function(pyodideLoaded){
			pyodide=pyodideLoaded;
			pyodide.loadPackage(["matplotlib","micropip"]).then(function(){
			pyodide.runPythonAsync(`
	from pyodide.http import pyfetch
	response = pyfetch("chrome-extension://`+OEEexidString+`/earthengine-api.tar.gz")
	response2 =pyfetch("chrome-extension://`+OEEexidString+`/OEE_Interface.py")
	unpack=(await response).unpack_archive()
	with open("OEE_Interface.py", "wb") as f:
		f.write(await (await response2).bytes())
	await unpack
			`).then(function(){
				pyee=pyodide.pyimport("ee");
				console.log("ee charge in Py env")
				pyee.Initialize()
				console.log("ee is initialized")
				pyoee=pyodide.pyimport("OEE_Interface");
				console.log("OEE interface is initialized")
				window.dispatchEvent(new CustomEvent('pyodideLoaded'));
				console.log(`Python load time: ${Date.now() - start} ms`);
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
// if(window.location.pathname!=="/" || new URLSearchParams(window.location.search).get("scriptPath")){
// 	setTimeout("injectPythonCE();",1)
// }else{
// 	setTimeout("injectPythonCE();",10)
// }

function oeeRequire(path){
	let sourceCode=requestCodeSync(path);
	'use strict'
	return eval("(function(){var exports={};" +sourceCode+"\n return exports})()")
}

function requestCodeSync(requestedPath){
	
	let path=requestedPath.split(":");
	let url="https://code.earthengine.google.com/repo/file/load?repo="+encodeURI(path[0])+"&path="+encodeURI(path[1]);

	const request = new XMLHttpRequest();
	request.open("GET", url, false); // `false` makes the request synchronous
	
	request.setRequestHeader('X-XSRF-Token',window._ee_flag_initialData.xsrfToken);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(null);

	if (request.status === 200) {
		return JSON.parse(request.responseText);
	}else{
		throw request.responseText
	}
}

async function requestCodeAsync(requestedPath) {
    return new Promise((resolve, reject) => {
        let path = requestedPath.split(":");
        let url = "https://code.earthengine.google.com/repo/file/load?repo=" + encodeURI(path[0]) + "&path=" + encodeURI(path[1]);

        const request = new XMLHttpRequest();
        request.open("GET", url, true); // `true` makes the request asynchronous

        request.setRequestHeader('X-XSRF-Token', window._ee_flag_initialData.xsrfToken);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function () {
            if (request.status === 200) {
                resolve(JSON.parse(request.responseText));
            } else {
                reject(request.responseText);
            }
        };

        request.onerror = function () {
            reject(Error("Network Error"));
        };

        request.send(null);
    });
}

async function requestListAsync(requestedRepoPath) {
    return new Promise((resolve, reject) => {
        let url = "https://code.earthengine.google.com/repo/load?repo=" + encodeURI(requestedRepoPath);

        const request = new XMLHttpRequest();
        request.open("GET", url, true); // `true` makes the request asynchronous

        request.setRequestHeader('X-XSRF-Token', window._ee_flag_initialData.xsrfToken);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function () {
            if (request.status === 200) {
                resolve(JSON.parse(request.responseText));
            } else {
                reject(request.responseText);
            }
        };

        request.onerror = function () {
            reject(Error("Network Error"));
        };

        request.send(null);
    });
}


function reRunCode(event){
	window.addEventListener(event,function(){
		document.querySelector(".goog-button.run-button").click()
	}, {once: true})
}

var EEInstalledPackageList=[];

async function importSingleEEPackage(path){
	pathPart=path.split(":")
	let list=(await requestListAsync(pathPart[0]))["tree"];
	let split=pathPart[1].split("/");
	for (var i = 0; i < split.length; i++) {
		list=list[split[i]];
	}

	function importSingleEEPackageInTree(obj,currentPath){
		listPromise=[];
		let listKeys=Object.keys(obj);
		for (var i = listKeys.length - 1; i >= 0; i--) {
			let key=listKeys[i];
			if(obj[key]==null)
			{
				listPromise.push(new Promise((resolve, reject) => {
					requestCodeAsync(currentPath+"/"+key)
						.then(function(val){
							obj[key]=val;
							resolve(true)
						}).catch(error=>{reject(error)});
				}));
			}
			else
				listPromise=listPromise.concat(importSingleEEPackageInTree(obj[key],currentPath+"/"+key));
		}
		return listPromise;
	}

	listPromises=importSingleEEPackageInTree(list,path);
	await Promise.all(listPromises)
	await pyoee.installPackageFromObject(list,path);
	EEInstalledPackageList.push(path)
}


async function importEEPackages(list){
	return await Promise.all(list.map(p=>importSingleEEPackage(p)))
}

function checkForRequiredAndInstallMisingPackage(pkgs){
	let localInstall=[];
	if(typeof pkgs === "string")
		pkgs=[pkgs];
	let installedPkgs=pyoee.listPkgsInstalled();
	missingPkgs=pkgs.filter(item => !(installedPkgs.includes(item) || EEInstalledPackageList.includes(item)));
	if(missingPkgs.length==0)
		return
	else{
		/*let nonAvailableonPyodide=pkgs.filter(item => !pyodideAvailablePackage.includes(item));
		if(nonAvailableonPyodide.length>0)
		{
			console.log(nonAvailableonPyodide)
			throw "The following packages are currrently not available: "+nonAvailableonPyodide.join(", ")
			return;
		}*/
		reRunCode("oeeExtraPackageInstalled");
		eePackageList=missingPkgs.filter(item=>item.includes("/") && !item.includes("://"))
		let pip=pyodide.runPythonAsync(`
			import micropip
			await micropip.install(`+JSON.stringify(missingPkgs.filter(item => !eePackageList.includes(item)))+`);`)
		eePackage=importEEPackages(eePackageList);
		Promise.all([pip, eePackage]).then(function(){
			window.dispatchEvent(new CustomEvent('oeeExtraPackageInstalled'));
		}).catch(function(error){
			//alert(error)
			[...document.querySelector("ee-console-log").shadowRoot.querySelectorAll("div.message.severity-error")]
				.filter(x=>x.textContent.includes("They are under installation your code should restart just after"))
				.map(x=> x.querySelector(".summary").textContent=error);
		})
		throw "The following packages are missing: "+missingPkgs.join(", ")+"\nThey are under installation your code should restart just after."
	}
}

function runSendPython(inputVal){
	if(typeof pyoee == 'undefined' || typeof pyodide == 'undefined'){
		setTimeout(injectPythonCE,1);
		reRunCode("pyodideLoaded");
		return {answerType:"error", message:"Wait that Python is loaded and re-run the code\n The code should reboot automatically (<10s)."};
	}

	//currentInputUsed=inputElement;
	window.dispatchEvent(new CustomEvent('startPython'));
	let regexPattern=/.*#( )*req(|uirements):(?<req>.*?)($|#)/gm
	try {
		let requirementLine = [];
		let jsInput=inputVal;
		switch (jsInput.type) {
		case 'code':
			EEContext=inputVal.context;
			jsInput.code.replace(regexPattern, (match, p1,p2, req) => {
				requirementLine.push(req.trim());
			});
			requirementLine=[...new Set(requirementLine.map(item => item.split(",").map(subItem => subItem.trim())).flat())];
			checkForRequiredAndInstallMisingPackage(jsInput.extraPkgs.concat(requirementLine));
			let r=pyoee.run(jsInput.code,jsInput.dict)
			window.dispatchEvent(new CustomEvent('stopPython'));
			return oeeAsJS(r);
			break;
		case 'functionCall':
			let functionResult=pyoee.callFunction(jsInput.pyId,jsInput.functionName,jsInput.arg);
			window.dispatchEvent(new CustomEvent('stopPython'));
			return  oeeAsJS(functionResult);
			break;
		case 'loadModule':
			EEContext=inputVal.context;
			sourceCode=requestCodeSync(jsInput.path)
			let startPattern = "/\\*\\*\\*\\* Start of imports. If edited, may not auto-convert in the playground. \\*\\*\\*\\*/";
			let endPattern = "/\\*\\*\\*\\*\\* End of imports. If edited, may not auto-convert in the playground. \\*\\*\\*\\*\\*/";
			let regex = new RegExp(startPattern + "[\\s\\S]*" + endPattern, 'g');

			sourceCode = sourceCode.replace(regex, '');
			
			sourceCode.replace(regexPattern, (match, p1,p2, req) => {
				requirementLine.push(req.trim());
			});
			requirementLine=[...new Set(requirementLine.map(item => item.split(",").map(subItem => subItem.trim())).flat())];
			checkForRequiredAndInstallMisingPackage(jsInput.extraPkgs.concat(requirementLine));

			let lodingInfo=pyoee.loadModule(sourceCode,jsInput.path)
			window.dispatchEvent(new CustomEvent('stopPython'));
			return oeeAsJS(lodingInfo);
			break;
		default:
			console.log(`Sorry ${jsInput.type} is unsuported.`);
			window.dispatchEvent(new CustomEvent('stopPython'));
			break;
		}
	} finally {
		window.dispatchEvent(new CustomEvent('stopPython'));
	}
}


// python detection
function overloadEditorForPython(){
	let isRuningCode=false;
	let defaultMode=editor.getSession().$mode;
	function isCodePython(codeSnippet) {
		let val=codeSnippet.startsWith("#");
		if(val && !editor.getSession().$modeId.includes("python")){
			editor.getSession().setMode('ace/mode/python')
		}
		if(!val && editor.getSession().$modeId.includes("python")){
			editor.getSession().setMode('ace/mode/javascript')
		}
		return val;
	}

	function runCode(){
		isRuningCode=true;
		setTimeout(function(){isRuningCode=false;},1);
	}

	document.querySelector(".goog-button.run-button").addEventListener("click",runCode,true);
	(function(){
		let v=editor.commands.commands.Execute.exec;
		editor.commands.commands.Execute.exec=function(){
			runCode();
			v();
		}
	})()

	function addJSPythonImportHeader(code){
		let predefineName=[...document.querySelectorAll('.env-entry-label')].map(x=>x.textContent);
		let dict={}
		for (var i = predefineName.length - 1; i >= 0; i--) {
			dict[predefineName[i]]=predefineName[i];
		}
		return "/*var oeel=require('users/OEEL/lib:loadAll');*/ require('users/mgravey/pythonCode:requirePython_v2').runPython("+JSON.stringify(code)+","+JSON.stringify(dict).replaceAll('"','')+",[]);";
	}

	editor.getSession().getValue=function(){
		let code=this.doc.getValue();
		if(isCodePython(code) && isRuningCode)
			return addJSPythonImportHeader(this.doc.getValue());
		else
			return this.doc.getValue();
	}
	editor.getSession().getValue()
}

var oeelSetEditorInterval=setInterval(function(){
	let editorElement=document.getElementsByClassName('ace_editor');
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		editor = ace.edit("editor");
	}

	if(typeof(editor)!="undefined"){
		clearInterval(oeelSetEditorInterval);
		overloadEditorForPython();
	}
},1);