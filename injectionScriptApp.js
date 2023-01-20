

function injectScripts(){
	let listOfScript=['addPlotly'];

	chrome.storage.local.get(listOfScript, function(result){
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
	var s = document.createElement('script');
	s.src = chrome.runtime.getURL('3rd_party/trustedtypes.api_only.build.js');
	s.onload = function() {
		this.remove();
		injectScripts();
	};
	(document.head || document.documentElement).appendChild(s);
}else{
	injectScripts();
}