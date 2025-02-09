// let OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];
let lightIsAutomatic=true;
let portWithBackground=null;

let OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
	createHTML: (string, sink) => string
});


function setPortWithBackground(){
	portWithBackground= chrome.runtime.connect(chrome.runtime.id,{name: "oeel.extension.lightMode"});
	

	portWithBackground.onMessage.addListener((request, sender, sendResponse) => {
		if(request.type=='changeLightMode'){
			if(request.message=='automatic'){
				// if((typeof buttonLight!= 'undefined') && buttonLight)
				// 	buttonLight.innerHTML=OEEexEscape.createHTML('brightness_medium');
				switch2DarkMode((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches),true)
			}else{
				switch2DarkMode(request.message,false);
			}
		};
	})
	portWithBackground.onDisconnect.addListener(function(port){	
		portWithBackground=null;
		setPortWithBackground();
	})

	document.addEventListener("requestDarkModeInfoEvent",function(event){
		portWithBackground.postMessage({type:"getLightMode"});
	})
	window.addEventListener("load", () => {
	    getLastModeValue();
	});
}


function switch2DarkMode(toDark,isAuto=false){
	const event = new CustomEvent("darkModeEvent", { detail: { toDark: toDark, isAuto:isAuto } });
	document.dispatchEvent(event);
}

function sendNewlightMode(mode){
	portWithBackground.postMessage({type:"setLightMode", message:mode});
}

function switchMode(){
	sendNewlightMode(!document.getElementsByTagName('html')[0].classList.contains('dark'));
}

function switchModeToAutomatic(){
	sendNewlightMode('automatic')
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
	getLastModeValue();
});

function setLightModeButton(){
	let button=document.createElement('ee-menu-button');
	button.innerHTML=OEEexEscape.createHTML('<span id="toogleModeButton"  slot="button"'+
		' class="material-icons" style="font-family: &quot;Material Icons&quot; ; color: rgba(115, 115, 115, 0.7);'+
		'  font-size: 0px; padding: 0 0 0 7px; vertical-align: bottom;">brightness_medium</span>');
	button.setAttribute('align',"right");
	let userBoxElement=document.getElementsByTagName('user-box')
	if(userBoxElement && userBoxElement.length>0){
		let localRoot=userBoxElement[0].shadowRoot;
		localRoot.children[0].insertBefore(button,localRoot.children[0].firstChild)

		let buttonLight=localRoot.getElementById('toogleModeButton');
		buttonLight.addEventListener("click", switchMode);
		buttonLight.addEventListener("dblclick", switchModeToAutomatic);

		setTimeout(function(){
			buttonLight.style["font-size"] = "24px";
		},100);
		
		document.addEventListener("darkModeEvent",function(event){
			let buttonMode='brightness_medium';
			if (!event.detail.isAuto) {
				buttonMode=(event.detail.toDark?'brightness_high':'brightness_4')
			}
			buttonLight.innerHTML=OEEexEscape.createHTML(buttonMode)
		})		

		let sheet = new CSSStyleSheet
		sheet.replaceSync( '.user-box.dark { background-color:black } .dark .project-label {background: #1e1d1d; box-shadow: #1e1d1d 0px 0px 4px 1px inset;}')
		// Append your style to the existing style sheet.
		localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];

		document.addEventListener("darkModeEvent",function(event){
			localRoot.firstElementChild.classList.toggle('dark', event.detail.toDark)
		})
	}
}

function htmlRoot(event){
	let html=document.getElementsByTagName('html')[0];
	document.addEventListener("darkModeEvent",function(event){
		html.classList.toggle('dark', event.detail.toDark)
	})
}

function taskPanel(event){
	let eeTaskPaneList=document.getElementsByTagName('ee-task-pane');
	
	if(!(eeTaskPaneList && eeTaskPaneList.length>0)) return

	{
		let localRoot=eeTaskPaneList[0].shadowRoot;
		let sheet = new CSSStyleSheet
		sheet.replaceSync( '.dark .header,.dark .section-title{ color:var(--oeel-color); }');
		localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];
		document.addEventListener("darkModeEvent",function(event){
			[...localRoot.children].map(e=>e.classList.toggle('dark', event.detail.toDark))
		})
	}

	{
		let localRoot=eeTaskPaneList[0].shadowRoot.querySelector('ee-remote-task-list').shadowRoot;
		let sheet = new CSSStyleSheet
		sheet.replaceSync( '.dark .task.legacy .info,.dark.section-title{ color:var(--oeel-color); } .dark .task.legacy .info .error-message {color: #e34a4a;}'+
			'.dark .task.legacy .content {background-color: #545454;}'+
			'.dark .task.legacy.failed .content {background-color: rgb(187, 0, 0);}'+
			'.dark .task.legacy.completed .content {background-color: var(--ee-legacy-blue);}'+
			'.dark .task.legacy .indicator{filter: invert(1)}  .dark .task.task.submitted-to-backend .indicator, .dark .task.task.running-on-backend .indicator{filter: invert(1) hue-rotate(180deg) brightness(1.5);transform: rotate(180deg);}'+
			'.dark .task.legacy.failed .indicator{filter: brightness(1.5);} .dark .task.legacy:not(.completed):not(.failed) .content{background-color: rgb(86 86 86);}'+
			'.dark .task.legacy.type-INGEST_TABLE .content::before{background-image: url(//www.gstatic.com/images/icons/material/system/1x/file_upload_white_24dp.png);}');
		localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];
		document.addEventListener("darkModeEvent",function(event){
			[...localRoot.children].map(e=>e.classList.toggle('dark', event.detail.toDark))
		})
	
		let sheetTaskPan = new CSSStyleSheet
		sheetTaskPan.replaceSync( '.dark .task.legacy .content {background-color: #545454;}');
		eeTaskPaneList[0].shadowRoot.adoptedStyleSheets=[...eeTaskPaneList[0].shadowRoot.adoptedStyleSheets,sheetTaskPan];
	}
}

function docsListPanel(event){
	let docList=document.querySelector('ee-docs-list')
	if(!docList) return
	document.addEventListener("darkModeEvent",function(event){
		docList.classList.toggle('dark', event.detail.toDark)
	})
	let localRoot=docList.shadowRoot;
	let sheet = new CSSStyleSheet;
	sheet.replaceSync(':host(.dark) ee-zippy > .header:hover {background: var(--color-hover-bg);}'+
		':host(.dark) ee-zippy > .header::before {filter:invert()}');
	localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];
}


function consolPanel(event){
	let eeConsole=document.getElementsByTagName('ee-console');
	if(!(eeConsole && eeConsole.length>0)) return;
	
	let localRoot=eeConsole[0].shadowRoot;
	let sheet = new CSSStyleSheet
	sheet.replaceSync( '.dark.intro-message.console-message{ color: hsl(0deg 0% 0% / 78%);');
	localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];

	document.addEventListener("darkModeEvent",function(event){
		[...localRoot.children].map(e=>e.classList.toggle('dark', event.detail.toDark))
	})
}


function registerElements(){
	setLightModeButton();
	htmlRoot();
	consolPanel();
	docsListPanel();
	taskPanel();
}

export function initialize(){
	setPortWithBackground();
	registerElements()
}

function getLastModeValue(){
	document.dispatchEvent(new CustomEvent("requestDarkModeInfoEvent"));
}

/*************** MT part **************************/

function switchCodeEditor(event){
	let editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		let editor = ace.edit("editor");
		let theme='xcode';
		if (event.detail.toDark){
			theme='tomorrow_night';
		}
		else{
			theme='xcode';
		}
		editor.setTheme('ace/theme/'+theme)
	}
}

function registerElementsMT(){
	document.addEventListener("darkModeEvent",switchCodeEditor);
}

export function initializeMT(){
	registerElementsMT();
	getLastModeValue();
}

