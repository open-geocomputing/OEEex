const aiDefaultConfig=
{
    "customPromptsEnabled": false,
    "gemini":
    {
        "apiKey": "",
        "customPrompt":
        {
            "alter_code": "",
            "explain_code": "",
            "fix_code": "",
            "generate_code": "",
            "high_level_explain_code": ""
        },
        "host": "https://generativelanguage.googleapis.com/v1beta/",
        "modelVersion": "gemini-2.0-flash"
    },
    "interface": "openai",
    "ollama":
    {
        "customPrompt":
        {
            "alter_code": "",
            "explain_code": "",
            "fix_code": "",
            "generate_code": "",
            "high_level_explain_code": ""
        },
        "host": "http://localhost:11434",
        "modelVersion": ""
    },
    "openai":
    {
        "apiKey": "",
        "customPrompt":
        {
            "alter_code": "",
            "explain_code": "",
            "fix_code": "",
            "generate_code": "",
            "high_level_explain_code": ""
        },
        "host": "https://api.openai.com/v1/",
        "modelVersion": "gpt-4o"
    }
}

let defaultParam={
	//isShareable:false,
	aiCodeGeneration:true,
	aiConfig:aiDefaultConfig,
	consoleError:true,
	copyAsJson:true,
	darkMode:true,
	docLink:true,
	editorSettings:true,
	ES_SC:(navigator.platform.toLowerCase().includes('mac')?{Execute: 'Command+Enter', 'Execute With Profiler': 'Alt+Command+Enter', Save: 'Command+S', Search: 'Alt+Command+F', Suggestion: 'Ctrl+Alt+Command+Space', alignCursors: 'Alt+Command+A'}:{}),
	ESfontFamily:"default",
	ESfontSize:13,
	EStabSize:2,
	insertFucntionSignature:true,
	lightMode: 'automatic',
	oeelCache:true,
	ollamaURL:"http://localhost:11434/",
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