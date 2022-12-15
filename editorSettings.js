var OEEexidString=document.currentScript.src.match("([a-z]{32})")[0];

function initEditorSettings(){

	var sheet = new CSSStyleSheet
	sheet.replaceSync( ":root{--editorFontSize:13px; --editorFontFamily:'Menlo','Monaco','DejaVu Sans Mono','Bitstream Vera Sans Mono','Consolas','source-code-pro',monospace }\n \
	  #editor.ace_editor.enable-suggestions .stan-underline{ height: calc( var(--editorFontSize, 13px) - 1px) !important; }\
	  .env-list .zippy .header{font-size:calc( var(--editorFontSize, 13px) + 1px)}")
	// Append your style to the existing style sheet.
	document.adoptedStyleSheets=[...document.adoptedStyleSheets,sheet];

	let root = document.documentElement;
	
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
	

	let portWithBackground=null;

	function setPortWithBackground(){
		portWithBackground= chrome.runtime.connect(OEEexidString,{name: "oeel.extension.editorSettings"});
		portWithBackground.onMessage.addListener((request, sender, sendResponse) => {
			if(request.type=='changeFont'){
				if (request.message.ESfontSize)		root.style.setProperty('--editorFontSize', request.message.ESfontSize + "px");
				if (request.message.ESfontFamily){
					root.style.setProperty('--editorFontFamily', request.message.ESfontFamily);
					if (request.message.ESfontFamily=='default')
						root.style.setProperty('--editorFontFamily', "'Menlo','Monaco','DejaVu Sans Mono','Bitstream Vera Sans Mono','Consolas','source-code-pro',monospace");
				}	
			};
		})
		portWithBackground.onDisconnect.addListener(function(port){	
			portWithBackground=null;
			setPortWithBackground();
		})
	}

	setPortWithBackground();
}

initEditorSettings();