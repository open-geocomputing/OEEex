// main.js

let permanentModule2Load=[
    "externalLoad",
    "OEEMenu", // add the OEE Menu in the top right corner
    "surveyMessage"
];

let moules2Load = [    
    "copyAsJson",
    "darkMode",
    "editorSettings",
    "openInNewTab",
    "plotly",
    "runAll",
    "sharedCodeSession",
    "uploadWithManifest"
];

// Load all permanent modules
for (let i = 0; i < permanentModule2Load.length; i++) {
    const moduleName = permanentModule2Load[i];
    import('./modules/' + moduleName + '.js')
        .then(module => {
            if (module.initialize) {
                module.initialize();
                console.log(moduleName)
            }
        })
        .catch(err => {
            console.error('Error loading ' + moduleName + ':', err);
        });
}


// Load all relevant settings from storage
chrome.storage.local.get(moules2Load, function(items) {
    for (let i = 0; i < moules2Load.length; i++) {
        const moduleName = moules2Load[i];
        
        // Check if the module is enabled (i.e., true) before loading
        if (items[moduleName]) { // temporarly force all
            import('./modules/' + moduleName + '.js')
                .then(module => {
                    if (module.initialize) {
                        module.initialize();
                        console.log(moduleName)
                    }
                })
                .catch(err => {
                    console.error('Error loading ' + moduleName + ':', err);
                });
        }
    }
});

/*************** MT part **************************/

let moulesMT2Load = [
    "aiCodeGeneration",
    "consoleError",
    "darkMode",
    "docLink",
    "editorSettings",
    "insertFucntionSignature",
    "plotly",
    "pythonCE",
    "sharedCodeSession",
    "terminal",
    "uploadWithManifest"
];

chrome.storage.local.get(moulesMT2Load, function(items) {
    window.dispatchEvent(new CustomEvent("moduleMT2Load",{detail:{modules:items, extensionId:chrome.runtime.id}}))
});

