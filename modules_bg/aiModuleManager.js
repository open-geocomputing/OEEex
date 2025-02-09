function removeOrigin(requestDetails) {
    details.requestHeaders = details.requestHeaders.filter(header => 
        header.name.toLowerCase() !== "origin"
    );

    return { requestHeaders: details.requestHeaders };
}

function firefoxAddWebRequest(url){
	browser.webRequest.onBeforeSendHeaders.addListener(
	    removeOrigin,
	    { urls: [url+"/*"] },
	    ["blocking", "requestHeaders"]
	);
}

function chromeAddNetRequest(url){
 	chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                "id": 2,  // Rule ID 2
                "priority": 1,
                "action": {
                    "type": "modifyHeaders",
                    "requestHeaders": [
                        {
                            "header": "Origin",
                            "operation": "remove"
                        }
                    ]
                },
                "condition": {
                    "urlFilter": (url+"/*").replace(/([^:])\/\//, '$1/'),
                    "resourceTypes": ["xmlhttprequest"]
                }
            }
        ],
        removeRuleIds: [2]
    });
}

function firefoxRemoveWebRequest(){
	browser.webRequest.onBeforeRequest.removeListener(removeOrigin);
}

function chromeRemoveNetRequest(){
	chrome.declarativeNetRequest.updateDynamicRules(
	{
		removeRuleIds: [2]
	})
}

function toggleCache(activate,url){
	if(activate){
		if(chrome.declarativeNetRequest)
			chromeAddNetRequest(url);
		else
			firefoxAddWebRequest(url);
	}else{
		if(chrome.declarativeNetRequest)
			chromeRemoveNetRequest();
		else
			firefoxRemoveWebRequest();
	}

}

export function initialize(){
	let status=false;
	let ollamaURL="";
	chrome.storage.local.get(['aiCodeGeneration','ollamaURL'], function(dict){
		status=dict["aiCodeGeneration"];
		ollamaURL=dict["ollamaURL"];
		toggleCache(status,ollamaURL);
	});
	chrome.storage.onChanged.addListener(function (changes, namespace) {
		if (changes.aiCodeGeneration || changes.ollamaURL) {
			if(changes.aiCodeGeneration && changes.aiCodeGeneration.oldValue !== changes.aiCodeGeneration.newValue)
				status=changes.aiCodeGeneration.newValue
			if(changes.ollamaUR && changes.ollamaURL.oldValue !== changes.ollamaURL.newValue)
				ollamaURL=changes.ollamaURL.newValue
			toggleCache(status,ollamaURL);
		}
	});
// }

// export function initialize(){
	chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
		if (request.action === "ollamaRequest") {
			fetch(...request.arguments).then(async (res) => {
			    const headers = Object.fromEntries(res.headers.entries());
			    const body = await res.text(); // Capture the body as text

			    // Serialize response
			    const serializedResponse = JSON.stringify({
			      status: res.status,
			      statusText: res.statusText,
			      headers,
			      body,
			    })
			    sendResponse(serializedResponse);
			})
		}
	});
}