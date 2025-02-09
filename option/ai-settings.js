document.addEventListener("DOMContentLoaded", function () {
    const aiInterface = document.getElementById("aiInterface");
    const settingsSections = document.querySelectorAll(".ai-settings");
    const customPromptToggle = document.getElementById("customPromptToggle");
    const customPromptSections = document.querySelectorAll(".custom-prompt-section");

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
        const aiConfig = {
            interface: aiInterface.value,
            customPromptsEnabled: customPromptToggle.checked,
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
                aiInterface.value = data.aiConfig.interface || "openai";
                customPromptToggle.checked = data.aiConfig.customPromptsEnabled || false;
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
        });
    }

    document.querySelector(".button.is-primary").addEventListener("click", saveAIConfig);
    document.querySelectorAll(".input, .textarea").forEach(input => {
        input.addEventListener("blur", saveAIConfig); // Auto-save on field blur
    });
    
    loadAIConfig();
});
