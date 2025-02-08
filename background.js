import { initialize as darkModeInitialize } from './modules_bg/darkModeManager.js';
import { initialize as oeelCacheInitialize } from './modules_bg/oeelCache.js';
import { initialize as actionButtonInitialize } from './modules_bg/actionButtonModuleManager.js';
import { initialize as initConfig } from './modules_bg/initConfig.js';
// import { initialize as messageChatGPTInitialize } from './modules_bg/messageChatGPT.js';

// // Add other module imports here

// // Initialize all modules
initConfig();
actionButtonInitialize();
darkModeInitialize(); 
oeelCacheInitialize();
// messageChatGPTInitialize();
// // Call initialize for all other modules
