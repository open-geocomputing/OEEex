function injectScripts(){
	let listOfScript=
	[
		'3rd_party/shpwrite',
		'addCopyJSON',
		'addLinkToDoc',
		'addPlotly',
		'addTerminal',
		'consoleError',
		'editorSettings',
		'EEDarkMode',
		'hackEE',
		'insertInCE',
		'isShareable',
		'openScriptNewTab',
		'planetLab',
		'pythonCE',
		'runAllTasks',
		'sharedCodeSession',
		'surveyMessage',
		'uploadWithManifest',
	].concat([ /// run first
		'OEEMenu',
	]);

	if(document.location.pathname=='/tasks'){
		listOfScript=['EEDarkMode'];
	}

	chrome.storage.local.get(listOfScript,
		function(result){			
			result['3rd_party/shpwrite']=result['uploadWithManifest'];
			for (var i = listOfScript.length - 1; i >= 0; i--) {
				let key=listOfScript[i]
				if(result[key]){
					var s = document.createElement('script');
					s.src = chrome.runtime.getURL(key+'.js');
					s.onload = function() {
						this.remove();
					};
					(document.head || document.documentElement).appendChild(s);
				}
			}
		});
}

isFirefox=typeof(trustedTypes)=="undefined";

if(isFirefox){
	let listConnector={};
	window.addEventListener("message", (event) => {
		if (event.source == window &&
			event.data &&
			event.data.direction == "p2e") {
			if(listConnector[event.data.connectInfo.name]==undefined){
				listConnector[event.data.connectInfo.name]=browser.runtime.connect(browser.runtime.id,event.data.connectInfo);
				listConnector[event.data.connectInfo.name].onMessage.addListener(function(val){
					window.postMessage({message:val,connectInfo:event.data.connectInfo,direction:"e2p"})
				})
				listConnector[event.data.connectInfo.name].onDisconnect.addListener((p) => {
					delete listConnector[event.data.connectInfo.name];
				});
			}
			listConnector[event.data.connectInfo.name].postMessage(event.data.message);
		}
	});

	var s = document.createElement('script');
	s.src = chrome.runtime.getURL('3rd_party/trustedtypes.api_only.build.js');
	s.onload = function() {
		this.remove();
		var s = document.createElement('script');
		s.src = chrome.runtime.getURL('externalConenctingfix.js');
		s.onload = function() {
			this.remove();
			injectScripts();
		};
		(document.head || document.documentElement).appendChild(s);
	};
	(document.head || document.documentElement).appendChild(s);
}else{
	injectScripts();
}

