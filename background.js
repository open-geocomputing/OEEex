// comunication with the front page

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.set({lightMode: 'automatic'});
	chrome.storage.local.set({
		addCopyJSON:true,
		addLinkToDoc:true,
		addPlotly:true,
		addTerminal:true,
		consoleError:true,
		editorSettings:true,
		EEDarkMode:true,
		ES_SC:(navigator.platform.toLowerCase().includes('mac')?{Execute: 'Command+Enter', 'Execute With Profiler': 'Alt+Command+Enter', Save: 'Command+S', Search: 'Alt+Command+F', Suggestion: 'Ctrl+Alt+Command+Space', alignCursors: 'Alt+Command+A'}:{}),
		ESfontFamily:"default",
		ESfontSize:13,
		EStabSize:2,
		geminiAddon:true,
		hackEE:false, //remove in the future
		insertInCE:true,
		isShareable:false,
		oeelCache:true,
		openScriptNewTab:true,
		planetLab:false,
		pythonCE:false,
		runAllTasks:true,
		surveyMessage:true,
		uploadWithManifest:true
	});
});


chrome.action.onClicked.addListener(tab => {
	if(tab.url.startsWith('https://code.earthengine.google.com')){
		chrome.tabs.create({ url: "https://www.open-geocomputing.org/OpenEarthEngineLibrary/" });
	}
	else{
		chrome.tabs.create({ url: "https://code.earthengine.google.com/" });
	}
});

function addListenerOnNewPort(port){
	port.onMessage.addListener((request, sender, sendResponse) => {
		if(request.type=='getLightMode'){
			chrome.storage.local.get(['lightMode'], function(mode) {
				if('lightMode' in mode)
					sender.postMessage({ type:'changeLightMode', message: mode['lightMode'] });
				else
					sender.postMessage({ type:'changeLightMode', message: 'automatic' });
			});
		}

		if(request.type=='setLightMode'){
			chrome.storage.local.set({lightMode: request.message});
			for (var i = listPort.length - 1; i >= 0; i--) {
				listPort[i].postMessage({ type:'changeLightMode', message: request.message });
			}
		}
		
	});
}

function portConnection(port) {
	if(port.name === "oeel.extension.lightMode"){
		listPort.push(port);
		addListenerOnNewPort(port);
		port.onDisconnect.addListener(function() {
			listPort= listPort.filter(function(el) { return el !== port});
		});
	}
}

listPort=[]
chrome.runtime.onConnectExternal.addListener(portConnection);
chrome.runtime.onConnect.addListener(portConnection);

//UwM
listManifestPort=[];

function sendUwMConfig(ports=listManifestPort){
	if(!Array.isArray(ports)){
		ports=[ports];
	}

	chrome.storage.local.get(['parallelUpload','parallelDownload'], function(data) {
		if('parallelUpload' in data){
			ports.map((sender)=>sender.postMessage({ type:'parallelUpload', message: data['parallelUpload'] }));
		}
		if('parallelDownload' in data){
			ports.map((sender)=>sender.postMessage({ type:'parallelDownload', message: data['parallelDownload'] }));
		}
	});
}

function UwMPortConnection(port) {
	if(port.name === "oeel.extension.UwM"){
		listManifestPort.push(port);
		sendUwMConfig(port);
		port.onDisconnect.addListener(function() {
			listManifestPort= listManifestPort.filter(function(el) { return el !== port});
		});
	}
}

chrome.storage.onChanged.addListener(function(){sendUwMConfig();});

chrome.runtime.onConnectExternal.addListener(UwMPortConnection);
chrome.runtime.onConnect.addListener(UwMPortConnection);


//editor Settings

listEditorPort=[]
function sendESConfig(ports=listEditorPort){
	if(!Array.isArray(ports)){
		ports=[ports];
	}

	chrome.storage.local.get(['ESfontSize','ESfontFamily','EStabSize','ES_SC'], function(data) {
		ports.map((sender)=>sender.postMessage({ type:'EditorSetting', message: data }));
	});
}

function ESPortConnection(port) {
	if(port.name === "oeel.extension.editorSettings"){
		listEditorPort.push(port);
		sendESConfig(port);
		port.onDisconnect.addListener(function() {
			listEditorPort= listEditorPort.filter(function(el) { return el !== port});
		});
	}
}

chrome.storage.onChanged.addListener(function(){sendESConfig();});

chrome.runtime.onConnectExternal.addListener(ESPortConnection);
chrome.runtime.onConnect.addListener(ESPortConnection);

//editor Settings

listAIPort=[]
function sendESConfig(ports=listAIPort){
	if(!Array.isArray(ports)){
		ports=[ports];
	}

	chrome.storage.local.get(['AiLanguage'], function(data) {
		ports.map((sender)=>sender.postMessage({ type:'AiSettings', message: data }));
	});
}

function ESPortConnection(port) {
	if(port.name === "oeel.extension.AiSettings"){
		listAIPort.push(port);
		sendESConfig(port);
		port.onDisconnect.addListener(function() {
			listAIPort= listAIPort.filter(function(el) { return el !== port});
		});
	}
}

chrome.storage.onChanged.addListener(function(){sendESConfig();});

chrome.runtime.onConnectExternal.addListener(ESPortConnection);
chrome.runtime.onConnect.addListener(ESPortConnection);


//oeel cache

function setOeelCache(active){

	let future;
	if(active){
		future=fetch('https://proxy-oeel-code.open-geocomputing.org/OpenEarthEngineLibrary/loadAll')
	}else{
		future=Promise.reject(new Error('oeelCacheDisabled'));
	}

	if(!chrome.declarativeNetRequest){ //firefox
		var oeel_redirect2Cache=true; 
		future.then(function(){
			oeel_redirect2Cache=true;
		}).catch(function(){
			oeel_redirect2Cache=false;
		})

		function redirect(requestDetails) {
			let newUrl="https://proxy-oeel-code.open-geocomputing.org/OpenEarthEngineLibrary/"+
			requestDetails.url.match("^https://code.earthengine.google.com/repo/file/load\\?repo=users%2FOEEL%2Flib\\&path=(.*)")[1];
			return {
				redirectUrl: newUrl
			};
		}

		browser.webRequest.onBeforeRequest.addListener(
			redirect,
			{urls:["https://code.earthengine.google.com/repo/file/load?repo=users%2FOEEL%2Flib&path=*"], types:["xmlhttprequest"]},
			["blocking"]
			);
		
	}else{
		future.then(function(){
			//sucess
			chrome.declarativeNetRequest.updateDynamicRules(
				{addRules:[{
					"id": 1,
					"priority": 1,
					"action": {
						"type": "redirect",
						"redirect": {
							"regexSubstitution": "https://proxy-oeel-code.open-geocomputing.org/OpenEarthEngineLibrary/\\1"
						}
					},
					"condition": {
						"regexFilter": "^https://code.earthengine.google.com/repo/file/load\\?repo=users%2FOEEL%2Flib\\&path=(.*)"
					}}],
					removeRuleIds: [1]
				})
		}).catch(function(){
			chrome.declarativeNetRequest.updateDynamicRules(
			{
				removeRuleIds: [1]
			})
		})
	}
}

chrome.storage.local.get(['oeelCache'], function(dict){setOeelCache(dict["oeelCache"]);});


// Planet
const PlanetRulesId=10;
function setPlanetApiKey(planetKey){
	if(planetKey)
		chrome.declarativeNetRequest.updateSessionRules(
			{addRules:[{
				"id": PlanetRulesId,
				"priority": 1,
				"action":{
			type: 'modifyHeaders',// as RuleActionType,
			requestHeaders: [
			{ 
				header: 'Authorization', 
				operation: 'set',// as HeaderOperation, 
				value: 'Basic '+btoa(planetKey+':')
			},
			],
		},
		"condition": { "regexFilter": "^https://(tiles|api)\\.planet\\.com/"}}
		],
		removeRuleIds: [PlanetRulesId]
	},
	)
}

function loadPlanetApiKey(dic){ 
	if('planetConfig' in dic){
		planetParam=dic['planetConfig'];
		if('newValue' in planetParam) planetParam=planetParam['newValue'];
		setPlanetApiKey(planetParam["apiKey"]);
	}
}

function checkDependances(dic){
	if('planetLab' in dic){
		if(dic['planetLab']['newValue'])
		{
			chrome.storage.local.set({uploadWithManifest:true})
		}
	}
	if('uploadWithManifest' in dic){
		if(!dic['uploadWithManifest']['newValue'])
		{
			chrome.storage.local.set({planetLab:false})
		}
	}
}

chrome.storage.onChanged.addListener(loadPlanetApiKey);
chrome.storage.onChanged.addListener(checkDependances);
chrome.storage.local.get(['planetConfig'], loadPlanetApiKey);


listPlanetPort=[];

function sendPlanetConfig(ports=listPlanetPort){
	if(!Array.isArray(ports)){
		ports=[ports];
	}

	chrome.storage.local.get(['planetConfig'], function(data) {
		if('planetConfig' in data){
			ports.map((sender)=>sender.postMessage({ type:'planetConfig', message: data['planetConfig'] }));
		}
	});
}

function PlanetPortConnection(port) {
	if(port.name === "oeel.extension.planet"){
		listPlanetPort.push(port);
		sendPlanetConfig(port);
		port.onDisconnect.addListener(function() {
			listPlanetPort= listPlanetPort.filter(function(el) { return el !== port});
		});
		port.onMessage.addListener((request, sender, sendResponse) => {
			if(request.type=='setPlanetConfig'){
				chrome.storage.local.set({planetConfig: request.message});
				sendPlanetConfig(listPlanetPort);
			}
		});
	}
}

chrome.storage.onChanged.addListener(function(){sendPlanetConfig();});

chrome.runtime.onConnectExternal.addListener(PlanetPortConnection);
chrome.runtime.onConnect.addListener(PlanetPortConnection);



// extrernal login

function requestAuth(request, sender, sendResponse) {
	const regex = /^https:\/\/.*-colab\.googleusercontent\.com.*$/;
	if((sender.origin=="https://colab.research.google.com"|| regex.test(sender.origin))&&request=="getAuthTocken"){
		fetch('https://code.earthengine.google.com/')
		.then(response => response.text())
		.then(data => {
			const authTokenRegex = /"authToken":\s*"([^"]+)"/;
			const match = data.match(authTokenRegex);
			if (match && match[1]) {
				const authToken = match[1];
				sendResponse({ type:'authToken', message: authToken })
			} else {
				sendResponse({ type:'error', message: "no authToken" })
			}
		})
		.catch(error => {
			console.error('Error:', error);
		});
	}
}

chrome.runtime.onMessageExternal.addListener(requestAuth);
