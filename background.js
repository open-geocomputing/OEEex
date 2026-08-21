import { initialize as darkModeInitialize } from './modules_bg/darkModeManager.js';
import { initialize as oeelCacheInitialize } from './modules_bg/oeelCache.js';
import { initialize as actionButtonInitialize } from './modules_bg/actionButtonModuleManager.js';
import { initialize as aiOllamaFetchInit } from './modules_bg/aiModuleManager.js';
import { initialize as initConfig } from './modules_bg/initConfig.js';
import { enableStudioUploadCorsWorkaround } from './modules_bg/studioUploadWorkaround.js';
// import { initialize as messageChatGPTInitialize } from './modules_bg/messageChatGPT.js';

// // Add other module imports here

// // Initialize all modules
initConfig();
actionButtonInitialize();
darkModeInitialize(); 
oeelCacheInitialize();
aiOllamaFetchInit();
// messageChatGPTInitialize();
// // Call initialize for all other modules

const PLAYGROUND_REQUIRE_RULE_ID = 1001;

async function enablePlaygroundRequirePatch() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [PLAYGROUND_REQUIRE_RULE_ID],
    addRules: [
      {
        id: PLAYGROUND_REQUIRE_RULE_ID,
        priority: 10000,
        action: {
          type: "redirect",
          redirect: {
            extensionPath: "/otherAssets/playgrounds_require.js",
          },
        },
        condition: {
          regexFilter:
            "^https://code\\.earthengine\\.google\\.(com|co\\.in)/javascript/playground\\.js(?:\\?.*)?$",
          resourceTypes: ["script"],
        },
      },
    ],
  });

  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  console.log("[OEEex DNR] dynamic rules", rules);
}

chrome.runtime.onInstalled.addListener(() => {
  enablePlaygroundRequirePatch().catch(console.error);
  enableStudioUploadCorsWorkaround().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  enablePlaygroundRequirePatch().catch(console.error);
  enableStudioUploadCorsWorkaround().catch(console.error);
});

enablePlaygroundRequirePatch().catch(console.error);
enableStudioUploadCorsWorkaround().catch(console.error);
