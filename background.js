// comunication with the front page

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({lightMode: 'automatic'});
    chrome.storage.local.set({
        planetLab:true,
        uploadWithManifest:true,
        hackEEConfirm:true,
        EEDarkMode:true,
        addCommandS:navigator.platform.toLowerCase().includes('mac')
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
    console.log(JSON.stringify(dic));
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
  }
}

chrome.storage.onChanged.addListener(function(){sendPlanetConfig();});

chrome.runtime.onConnectExternal.addListener(PlanetPortConnection);
chrome.runtime.onConnect.addListener(PlanetPortConnection);
