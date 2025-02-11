
function lightSetup(){
    var lightIsAutomatic=true;

    var portWithBackground=null;
    function setPortWithBackground(){
        portWithBackground= chrome.runtime.connect({name: "oeel.extension.lightMode"});
        portWithBackground.onDisconnect.addListener(function(port){ 
            portWithBackground=null;
            setPortWithBackground();
        })

        portWithBackground.onMessage.addListener((request,
             sender,
             sendResponse) => {
            if(request.type=='changeLightMode'){
                if(request.message=='automatic'){
                    switch2DarkMode((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches),
                            true)
                }else{
                    switch2DarkMode(request.message,
                            false);
                }
            };
        })
    }

    setPortWithBackground();


    function switch2DarkMode(toDark,
            isAuto=false){
        lightIsAutomatic=isAuto;
        document.getElementsByTagName('html')[0].classList.toggle('dark',toDark)
    };

    window.addEventListener("load",
         function(){
        portWithBackground.postMessage({type:"getLightMode"});
    });

    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',
         e => {
        if(lightIsAutomatic)
            switch2DarkMode(e.matches,
                    true);
    });
}
lightSetup();


function aiParamSetup(){

    let isLoading=false;
    const aiInterface = document.getElementById("aiInterface");
    const settingsSections = document.querySelectorAll(".ai-settings");
    const customPromptToggle = document.getElementById("customPromptToggle");
    const customPromptSections = document.querySelectorAll(".custom-prompt-section");
    const languageSelector = document.getElementById("languageSelector");

    function updateSettingsDisplay() {
        settingsSections.forEach(section => section.style.display = "none");
        document.querySelector(`.${aiInterface.value}-settings`).style.display = "block";
        saveAIConfig(); // Save when interface changes
    }

    function toggleCustomPrompts() {
        const isChecked = customPromptToggle.checked;
        customPromptSections.forEach(section => {
            section.style.display = isChecked ? "block" : "none";
        });
        saveAIConfig(); // Save when toggling
    }

    aiInterface.addEventListener("change", updateSettingsDisplay);
    customPromptToggle.addEventListener("change", toggleCustomPrompts);
    
    function collectSettings(interfaceName) {
        const settings = { customPrompt: {} };
        document.querySelectorAll(`.${interfaceName}-settings .input, .${interfaceName}-settings .textarea`).forEach(input => {
            if (input.classList.contains("custom-prompt")) {
                settings.customPrompt[input.dataset.type] = input.value || "";
            } else {
                settings[input.dataset.type] = input.value || "";
            }
        });
        return settings;
    }

    function saveAIConfig() {
        if (isLoading) return;
        const aiConfig = {
            interface: aiInterface.value,
            customPromptsEnabled: customPromptToggle.checked,
            language: languageSelector.value,
            openai: collectSettings("openai"),
            gemini: collectSettings("gemini"),
            ollama: collectSettings("ollama")
        };
        
        chrome.storage.local.set({ aiConfig }, () => {
            console.log("AI configuration saved:", aiConfig);
        });
    }

    function loadAIConfig() {
        chrome.storage.local.get("aiConfig", (data) => {
            if (data.aiConfig) {
                isLoading=true;
                aiInterface.value = data.aiConfig.interface || "openai";
                customPromptToggle.checked = data.aiConfig.customPromptsEnabled || false;
                languageSelector.value = data.aiConfig.language || "English";
                toggleCustomPrompts();
                ["openai", "gemini", "ollama"].forEach(interfaceName => {
                    if (data.aiConfig[interfaceName]) {
                        document.querySelectorAll(`.${interfaceName}-settings .input, .${interfaceName}-settings .textarea`).forEach(input => {
                            if (input.classList.contains("custom-prompt")) {
                                input.value = data.aiConfig[interfaceName].customPrompt[input.dataset.type] || "";
                            } else {
                                input.value = data.aiConfig[interfaceName][input.dataset.type] || "";
                            }
                        });
                    }
                });
                updateSettingsDisplay();
            }
            isLoading=false;
        });
    }

    loadAIConfig();

    document.querySelector(".button.is-primary").addEventListener("click", saveAIConfig);
    document.querySelectorAll(".input, .textarea").forEach(input => {
        input.addEventListener("blur", saveAIConfig); // Auto-save on field blur
    });
    languageSelector.addEventListener("change", saveAIConfig);
    
    
}


document.addEventListener("DOMContentLoaded", function () {
    aiParamSetup();
});
