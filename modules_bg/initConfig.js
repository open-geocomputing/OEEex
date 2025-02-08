let defaultParam={
	//isShareable:false,
	consoleError:true,
	copyAsJson:true,
	darkMode:true,
	docLink:true,
	editorSettings:true,
	EEDarkMode:true,
	ES_SC:(navigator.platform.toLowerCase().includes('mac')?{Execute: 'Command+Enter', 'Execute With Profiler': 'Alt+Command+Enter', Save: 'Command+S', Search: 'Alt+Command+F', Suggestion: 'Ctrl+Alt+Command+Space', alignCursors: 'Alt+Command+A'}:{}),
	ESfontFamily:"default",
	ESfontSize:13,
	EStabSize:2,
	insertFucntionSignature:true,
	lightMode: 'automatic',
	oeelCache:true,
	openInNewTab:true,
	plotly:true,
	pythonCE:true,
	runAll:true,
	sharedCodeSession:true,
	surveyMessage:true,
	terminal:true,
	uploadWithManifest:true
}

export function initialize(){
	chrome.runtime.onInstalled.addListener(function(details) {
		chrome.storage.local.get(Object.keys(defaultParam),function(currentParam){
			chrome.storage.local.set({ ...defaultParam, ...currentParam });	
		});
	});
}