
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
        if (aiInterface.value === 'ollama') {
            fetchOllamaModels(currentOllamaHost());
        }
        saveAIConfig();
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
            if (aiInterface.value === 'ollama') {
                fetchOllamaModels(currentOllamaHost());
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

    

    // --- Ollama model selector wiring ---
    const ollamaModelSelector = document.getElementById("ollamaModelSelector");
    const ollamaModelInput = document.getElementById("ollamaModelInput");

    async function fetchOllamaModels(host) {
        try {
            if (!host) return;
            const base = host.replace(/\/+$/,'') || 'http://localhost:11434';
            ollamaModelSelector.innerHTML = '<option value="">— loading —</option>';
            const res = await fetch(base + '/api/tags', { method: 'GET' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            const models = (data.models || []).map(m => m.name || m.model).filter(Boolean).sort();
            if (models.length === 0) {
                ollamaModelSelector.innerHTML = '<option value="">— no models found —</option>';
                return;
            }
            ollamaModelSelector.innerHTML = '<option value="">— select —</option>';
            models.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                ollamaModelSelector.appendChild(opt);
            });
            // Keep selector aligned with current input, if any
            const current = ollamaModelInput?.value?.trim();
            if (current) {
                const match = Array.from(ollamaModelSelector.options).find(o => o.value === current);
                if (match) ollamaModelSelector.value = current;
            }
        } catch (e) {
            console.warn('Failed to fetch Ollama models:', e);
            ollamaModelSelector.innerHTML = '<option value="">— error loading —</option>';
        }
    }

    function currentOllamaHost() {
        // read the visible Ollama Host field
        const hostInput = document.querySelector('.ollama-settings .input[data-type="host"]');
        return hostInput ? hostInput.value.trim() : '';
    }

    // When user selects a model, mirror into the text input
    ollamaModelSelector?.addEventListener('change', () => {
        if (!ollamaModelInput) return;
        const v = ollamaModelSelector.value || '';
        ollamaModelInput.value = v;
        saveAIConfig();
    });

    // When user types manually, try to reflect in selector if present
    ollamaModelInput?.addEventListener('blur', () => {
        const v = (ollamaModelInput.value || '').trim();
        const match = Array.from(ollamaModelSelector.options).find(o => o.value === v);
        ollamaModelSelector.value = match ? v : '';
        saveAIConfig();
    });

    document.querySelector('.ollama-settings .input[data-type="host"]')
        ?.addEventListener('blur', () => {
            if (aiInterface.value === 'ollama') fetchOllamaModels(currentOllamaHost());
        });
    
}


document.addEventListener("DOMContentLoaded", function () {
    aiParamSetup();
});
