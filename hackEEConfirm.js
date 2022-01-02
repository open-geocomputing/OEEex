const consoleExtensionPrefix='OEEex_AddonConfirmManager';
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
    if (!consoleExtensionVerbose){
        element.classList.add((consoleExtensionVerbose?"OEEexVerbose":"OEEexHide"));
    }
}

function loadConsoleWatcher(){
    var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
    var myObserver          = new MutationObserver(function(){
        [...document.querySelectorAll("pre.console > div.string:not(.OEEexAddonAnalysis)")].map(function(e){
            e.classList.add('OEEexAddonAnalysis')
            analysisGeeAddon(e)
        });
    });
    var obsConfig = { childList: true/*, characterData: true, attributes: true, subtree: true */};
    myObserver.observe(document.querySelector('pre.console'), obsConfig);

    document.querySelector('.goog-button.run-button').addEventListener('click',function(){listOfAuthorizedConfirm={};})
    document.querySelector('.goog-button.reset-button').addEventListener('click',function(){listOfAuthorizedConfirm={};})
}

overloadBackup();
loadConsoleWatcher();