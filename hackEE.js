const consoleExtensionPrefix='OEEex_AddonManager';
var consoleExtensionVerbose=false;

clone4OEE = function(that) {
    var temp = function temporary() { return that.apply(that, arguments); };
    for(var key in that) {
        if (that.hasOwnProperty(key)) {
            temp[key] = that[key];
        }
    }
    return temp;
};

listOfAuthorizedConfirm={};
var confirmBackup;
var overloadBackup=function(){
    if(!confirmBackup)confirmBackup=clone4OEE(window.confirm);
    window.confirm=function(e){
        console.log(e);
        var noForward=false;
        for (const key in listOfAuthorizedConfirm) {
            noForward|=e.includes(key) && (listOfAuthorizedConfirm[key]>0)
        }
        if(noForward){
            return true;
        }else{
            return confirmBackup(e);
        }
    }
}

function analysisGeeAddon(val){
    let obj=val.querySelector('.trivial');
    if(!obj)return;
    var consoleCode=obj.innerHTML;
    if(consoleCode.startsWith(consoleExtensionPrefix+':')){
        confirmManager(consoleCode,val);
        return; 
    }
}

function strToBool(s)
{

    regex=/^\s*(true|1|on)\s*$/i
    return regex.test(s);
}

function confirmManager(code,element){
    var instructions=code.slice(consoleExtensionPrefix.length+1);
    {
        var actionPrefix='removeConfirmRetain';
        if(instructions.startsWith(actionPrefix+':')){
            var confirmToManage=instructions.slice(actionPrefix.length+1);
            if(confirmToManage in listOfAuthorizedConfirm){
                listOfAuthorizedConfirm[confirmToManage]++;
            }else{
                listOfAuthorizedConfirm[confirmToManage]=1;
            }
        }
    }
    {
        var actionPrefix='removeConfirmRelease';
        if(instructions.startsWith(actionPrefix+':')){
            var confirmToManage=instructions.slice(actionPrefix.length+1);
            if(confirmToManage in listOfAuthorizedConfirm){
                listOfAuthorizedConfirm[confirmToManage]--;
            }
        }
    }
    {
        var actionPrefix='resetConfirm';
        if(instructions.startsWith(actionPrefix)){
           listOfAuthorizedConfirm={};
        }
    }
    {
        var actionPrefix='verbose';
        if(instructions.startsWith(actionPrefix+':')){
            var status=instructions.slice(actionPrefix.length+1);
            consoleExtensionVerbose=strToBool(status);
        }
    }
    {
        var actionPrefix='createCollection';
        if(instructions.startsWith(actionPrefix+':')){
            let path=instructions.slice(actionPrefix.length+1);
            let geeRequest=new XMLHttpRequest();
            geeRequest.open("POST",'https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/assets?assetId='+encodeURI(path),true);
            geeRequest.responseType = 'json';
            geeRequest.onload = function(e) {
                if (this.status == 200) {
                    
                }
                else{
                    alert("error in path creation: "+path+'\n'+
                        this.response["error"]["message"]);
                }
            }
            geeRequest.setRequestHeader("Authorization", ee.data.getAuthToken());
            geeRequest.send('{"type":"IMAGE_COLLECTION"}');
        }
    }
    {
        var actionPrefix='exportImage';
        if(instructions.startsWith(actionPrefix+':')){
            var config=instructions.slice(actionPrefix.length+1);
            let geeRequest=new XMLHttpRequest();
            geeRequest.open("POST",'https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/image:export',true);
            geeRequest.responseType = 'json';
            geeRequest.onload = function(e) {
                if (this.status == 200) {
                    
                }
                else{
                    alert("Unable to export image");
                }
            }
            geeRequest.setRequestHeader("Authorization", ee.data.getAuthToken());
            geeRequest.send(config)
        }
    }
    {
        var actionPrefix='exportTable';
        if(instructions.startsWith(actionPrefix+':')){
            var config=instructions.slice(actionPrefix.length+1);
            let geeRequest=new XMLHttpRequest();
            geeRequest.open("POST",'https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/table:export',true);
            geeRequest.responseType = 'json';
            geeRequest.onload = function(e) {
                if (this.status == 200) {
                    
                }
                else{
                    alert("Unable to export table");
                }
            }
            geeRequest.setRequestHeader("Authorization", ee.data.getAuthToken());
            geeRequest.send(config)
        }
    }
    {
        var actionPrefix='exportVideo';
        if(instructions.startsWith(actionPrefix+':')){
            var config=instructions.slice(actionPrefix.length+1);
            let geeRequest=new XMLHttpRequest();
            geeRequest.open("POST",'https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/video:export',true);
            geeRequest.responseType = 'json';
            geeRequest.onload = function(e) {
                if (this.status == 200) {
                    
                }
                else{
                    alert("Unable to export video");
                }
            }
            geeRequest.setRequestHeader("Authorization", ee.data.getAuthToken());
            geeRequest.send(config)
        }
    }
    if (!consoleExtensionVerbose){
        element.classList.add((consoleExtensionVerbose?"OEEexVerbose":"OEEexHide"));
    }
}

function loadConsoleWatcher(){
    let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
    let myObserver          = new MutationObserver(function(mutList){

        [...mutList].map(function(mut){
            [...mut.addedNodes].map(function(e){
                if(e.classList.contains('OEEexAddonAnalysis'))
                    return;
                e.classList.add('OEEexAddonAnalysis')
                analysisGeeAddon(e)
            });
        });
    });
    
    var obsConfig = { childList: true/*, characterData: true, attributes: true, subtree: true */};
    myObserver.observe(document.querySelector('ee-console'), obsConfig);
    if(document.querySelector('.goog-button.run-button'))
        document.querySelector('.goog-button.run-button').addEventListener('click',function(){listOfAuthorizedConfirm={};})
    if(document.querySelector('.goog-button.reset-button'))
        document.querySelector('.goog-button.reset-button').addEventListener('click',function(){listOfAuthorizedConfirm={};})
}

overloadBackup();
loadConsoleWatcher();