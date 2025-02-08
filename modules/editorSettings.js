// var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

function initEditorSettings(){

	var sheet = new CSSStyleSheet
	sheet.replaceSync( ":root{--editorFontSize:13px; --editorFontFamily:'Menlo','Monaco','DejaVu Sans Mono','Bitstream Vera Sans Mono','Consolas','source-code-pro',monospace }\n \
		#editor.ace_editor.enable-suggestions .stan-underline{ height: calc( var(--editorFontSize, 13px) - 1px) !important; }\
		.env-list .zippy .header{font-size:calc( var(--editorFontSize, 13px) + 1px)}")
	// Append your style to the existing style sheet.
	document.adoptedStyleSheets=[...document.adoptedStyleSheets,sheet];
	
	function removeOriginalFontInCE(){
		try{
			[...document.querySelector("div.ace_editor").parentElement.childNodes].
			map(e=>e.setAttribute('style',(e.getAttribute('style')?e.getAttribute('style'):"")+
				"font-family: var(--editorFontFamily, 'Menlo','Monaco','DejaVu Sans Mono','Bitstream Vera Sans Mono','Consolas','source-code-pro',monospace )!important;font-size: var(--editorFontSize, 13px)!important"));
		}catch(e){
			setTimeout(removeOriginalFontInCE,10)
		}
	}

	removeOriginalFontInCE();

	function applyConfig(data){
		if (Object.keys(data).length === 0) return;
		document.dispatchEvent(new CustomEvent("EC_seetings",{detail:data}))
	}

	let EC_configList=['ESfontSize','ESfontFamily','EStabSize','ES_SC']
	
	chrome.storage.local.get(EC_configList, function(data) {
		applyConfig(data)
	});

	chrome.storage.onChanged.addListener((changes, area) => {
		if(area!=="local") return;
		applyConfig(Object.fromEntries(
			EC_configList
					.filter(key => changes[key]) // Keep only existing keys
					.map(key => [key, changes[key].newValue]) // Replace object with newValue
					))

	});
}


export function initialize(){
	initEditorSettings();
}

/*************** MT part **************************/

// // var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

function setECSettings(request){
	let editor=null;
	let editorElement=document.getElementsByClassName('ace_editor')
	if( editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		editor = ace.edit("editor");
	}else{
		setTimeout(setECSettings,10,request);
		return;
	}


	if(!(editor.commands && editor.setOption)) return;

	let root = document.documentElement;
	if (request.ESfontSize) root.style.setProperty('--editorFontSize', request.ESfontSize + "px");
	if (request.ESfontFamily){
		root.style.setProperty('--editorFontFamily', request.ESfontFamily);
		if (request.ESfontFamily=='default')
			root.style.setProperty('--editorFontFamily', "'Menlo','Monaco','DejaVu Sans Mono','Bitstream Vera Sans Mono','Consolas','source-code-pro',monospace");
	}	
	if (request.EStabSize) setTimeout(function(){editor.setOption('tabSize',request.EStabSize)},1);
	if (request.ES_SC){
		for (const [key, value] of Object.entries(request.ES_SC)) {
			editor.commands.commands[key].bindKey.mac=value;
			editor.commands.commands[key].bindKey.win=value;
		}
		editor.commands.addCommands(editor.commands.commands)
	}
}


export function initializeMT(){
	//initEditorSettings();

	document.addEventListener("EC_seetings",function(event){
		setECSettings(event.detail)
	})
}