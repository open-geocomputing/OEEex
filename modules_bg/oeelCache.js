function redirect(requestDetails) {
	let newUrl="https://proxy-oeel-code.open-geocomputing.org/OpenEarthEngineLibrary/"+
	requestDetails.url.match("^https://code.earthengine.google.com/repo/file/load\\?repo=users%2FOEEL%2Flib\\&path=(.*)")[1];
	return {
		redirectUrl: newUrl
	};
}

function firefoxAddWebRequest(future){
	future.then(function(){
		

		browser.webRequest.onBeforeRequest.addListener(
			redirect,
			{urls:["https://code.earthengine.google.com/repo/file/load?repo=users%2FOEEL%2Flib&path=*"], types:["xmlhttprequest"]},
			["blocking"]
			);
	}).catch(function(){
		//nothing
	})
}

function chromeAddNetRequest(future){
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

function firefoxRemoveWebRequest(){
	browser.webRequest.onBeforeRequest.removeListener(redirect);
}

function chromeRemoveNetRequest(){
	chrome.declarativeNetRequest.updateDynamicRules(
	{
		removeRuleIds: [1]
	})
}

function checkIfCacheServerWork(){
	return fetch('https://proxy-oeel-code.open-geocomputing.org/OpenEarthEngineLibrary/loadAll');
}

function toggleCache(activate){
	if(activate){
		let future=checkIfCacheServerWork();
		if(chrome.declarativeNetRequest)
			chromeAddNetRequest(future);
		else
			firefoxAddWebRequest(future);
	}else{
		if(chrome.declarativeNetRequest)
			chromeRemoveNetRequest();
		else
			firefoxRemoveWebRequest();
	}

}

export function initialize(){
	chrome.storage.local.get(['oeelCache'], function(dict){
		toggleCache(dict["oeelCache"])
	});
	chrome.storage.onChanged.addListener(function (changes, namespace) {
		if (changes.oeelCache && changes.oeelCache.oldValue !== changes.oeelCache.newValue) {
			toggleCache(changes.oeelCache.newValue);
		}
	});
}