// comunication with the front page

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({lightMode: 'automatic'});
    chrome.storage.local.set({
        uploadWithManifest:true,
        hackEEConfirm:true,
        EEDarkMode:true,
        addCommandS:navigator.platform.toLowerCase().includes('mac')
    });
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
