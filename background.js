// comunication with the front page

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.set({lightMode: 'automatic'});
    chrome.storage.local.set({dynamicPlotly: false});
    chrome.storage.local.set({
        isShareable:true,
        insertInCE:true,
        planetLab:false,
        uploadWithManifest:true,
        hackEE:true,
        EEDarkMode:true,
        addCommandS:navigator.platform.toLowerCase().includes('mac'),
        runAllTasks:true,
        oeelCache:true,
        addCopyJSON:true,
        openScriptNewTab:true,
        addPlotly:true
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


// dynamic plotly

listPlotlyPort=[];

function addListnerPlotlyConfig(ports=listPlotlyPort){
    if(!Array.isArray(ports)){
        ports=[ports];
    }

    ports.map((port)=>port.onMessage.addListener((request, sender, sendResponse) => {
        if(request.type=='getDynamicPlotly'){
            chrome.storage.local.get(['dynamicPlotly'], function(mode) {
                if('dynamicPlotly' in mode)
                    sender.postMessage({ type:'setDynamicPlotly', message: mode['dynamicPlotly'] });
            });
        }

        if(request.type=='setDynamicPlotly'){
            chrome.storage.local.set({dynamicPlotly: request.message});
            for (var i = listPort.length - 1; i >= 0; i--) {
                listPlotlyPort[i].postMessage({ type:'setDynamicPlotly', message: request.message });
            }
        }
    }));
}

chrome.storage.onChanged.addListener(function(dic){
    if( "dynamicPlotly" in dic){
        for (var i = listPort.length - 1; i >= 0; i--) {
            console.log(listPlotlyPort[i])
            if(listPlotlyPort[i]) listPlotlyPort[i].postMessage({ type:'setDynamicPlotly', message: dic["dynamicPlotly"].newValue });
        }
    } 
    if( "oeelCache" in dic){
        setOeelCache(dic["oeelCache"].newValue);
    } 
});


function plotlyPortConnection(port) {
  if(port.name === "oeel.extension.plotly"){
    listPlotlyPort.push(port);
    addListnerPlotlyConfig(port);
    port.onDisconnect.addListener(function() {
        listPlotlyPort= listPlotlyPort.filter(function(el) { return el !== port});
    });
}
}

chrome.storage.onChanged.addListener(function(){addListnerPlotlyConfig();});
chrome.runtime.onConnectExternal.addListener(plotlyPortConnection);
chrome.runtime.onConnect.addListener(plotlyPortConnection);



//oeel cache

function setOeelCache(active){

    let future;
    if(active){
        future=fetch('https://proxy-oeel-code.open-geocomputing.org:47849/OpenEarthEngineLibrary/loadAll')
    }else{
        future=Promise.reject(new Error('oeelCacheDisabled'));
    }

    future.then(function(){
        //sucess
        chrome.declarativeNetRequest.updateDynamicRules(
         {addRules:[{
            "id": 1,
            "priority": 1,
            "action": {
              "type": "redirect",
              "redirect": {
                "regexSubstitution": "https://proxy-oeel-code.open-geocomputing.org:47849/OpenEarthEngineLibrary/\\1"
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
