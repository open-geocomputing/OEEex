var lightIsAutomatic=true;
var portWithBackground = chrome.runtime.connect(document.currentScript.src.match("([a-z]{32})")[0],{name: "oeel.extension.lightMode"});

portWithBackground.onMessage.addListener((request, sender, sendResponse) => {
	if(request.type=='changeLightMode'){
		if(request.message=='automatic'){
			if((typeof buttonLight!= 'undefined') && buttonLight)
				buttonLight.innerHTML='brightness_medium';
			switch2DarkMode((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches),true)
		}else{
			switch2DarkMode(request.message,false);
		}
	};
})

function switch2DarkMode(toDark,isAuto=false){
	lightIsAutomatic=isAuto;
	if (toDark){
		listRoot.map( e => e.classList.add('dark'));
	}
	else{
		listRoot.map( e => e.classList.remove('dark'));
	}

	var editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		var editor = ace.edit("editor");
		var theme='xcode';
		if (toDark){
			theme='tomorrow_night';
			buttonMode='brightness_high'
		}
		else{
			theme='xcode';
			buttonMode='brightness_4'
		}
		editor.setTheme('ace/theme/'+theme)
		
		if(!isAuto){
			buttonLight.innerHTML=buttonMode;
		}
	}

	// fix a weird bug when changing color
	setTimeout("[...document.getElementsByClassName('goog-tab goog-tab-selected')].map(e => e.click())",10);
};

var listRoot=[];

function addModeSwitch(){
	listRoot.push(document.getElementsByTagName('html')[0]);

	window.addEventListener("load", function(){
		portWithBackground.postMessage({type:"getLightMode"});
	});

	let fontLink = document.createElement('link');
	fontLink.type = 'text/css';
	fontLink.rel = 'stylesheet';
	(document.head || document.documentElement).appendChild(fontLink);
	fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons"

	let button=document.createElement('ee-menu-button');
	button.innerHTML='<span id="toogleModeButton"  slot="button"'+
	' class="material-icons" style="font-family: &quot;Material Icons&quot; ; color: rgba(115, 115, 115, 0.7);'+
	'  font-size: 0px; padding: 0 0 0 7px; vertical-align: bottom;">brightness_medium</span>';
	button.setAttribute('align',"right");
	let userBoxElement=document.getElementsByTagName('user-box')



	if(userBoxElement && userBoxElement.length>0)
	{
		var localRoot=userBoxElement[0].shadowRoot;
		
		localRoot.children[0].insertBefore(button,localRoot.children[0].firstChild)


		buttonLight=localRoot.getElementById('toogleModeButton');
		buttonLight.addEventListener("click", switchMode);
		buttonLight.addEventListener("dblclick", switchModeToAutomatic);

		setTimeout(function(){
			buttonLight.style["font-size"] = "24px";
		},100);		

		listRoot.push(localRoot.firstElementChild);
		var sheet = new CSSStyleSheet
		sheet.replaceSync( '.user-box.dark { background-color:black } .dark .project-label {background: #1e1d1d; box-shadow: #1e1d1d 0px 0px 4px 1px inset;}')
		// Append your style to the existing style sheet.
		localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];
	}

	var eeTaskPaneList=document.getElementsByTagName('ee-task-pane');
	if(eeTaskPaneList && eeTaskPaneList.length>0){
		var localRoot=eeTaskPaneList[0].shadowRoot.querySelector('ee-remote-task-list').shadowRoot;
		var sheet = new CSSStyleSheet
		sheet.replaceSync( '.dark .task.legacy .info{ color:var(--oeel-color); } .dark .task.legacy .info .error-message {color: #e34a4a;}'+
			'.dark .task.legacy .indicator{filter: invert(1)}  .dark .task.task.submitted-to-backend .indicator, .dark .task.task.running-on-backend .indicator{filter: invert(1) hue-rotate(180deg) brightness(1.5);transform: rotate(180deg);}'+
			'.dark .task.legacy.failed .indicator{filter: brightness(1.5);} .dark .task.legacy:not(.completed):not(.failed) .content{background-color: rgb(86 86 86);}'+
			'.dark .task.legacy.type-INGEST_TABLE .content::before{background-image: url(//www.gstatic.com/images/icons/material/system/1x/file_upload_white_24dp.png);}');
		localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];
		[...localRoot.children].map(e=>listRoot.push(e))
	}

	// task page
	
	var eeTaskPaneList=document.getElementsByTagName('ee-task-manager-app');
	if(eeTaskPaneList && eeTaskPaneList.length>0){

		var sheet = new CSSStyleSheet
		sheet.replaceSync( 'logo.dark>img{filter: invert(1) hue-rotate(180deg) brightness(1.5);} .dark{ color:#C5C8C6; }'
			);
		eeTaskPaneList[0].shadowRoot.adoptedStyleSheets=[...eeTaskPaneList[0].shadowRoot.adoptedStyleSheets,sheet];

		[...eeTaskPaneList[0].shadowRoot.querySelectorAll('div')].map(e=>listRoot.push(e));

		var localRoot=eeTaskPaneList[0].shadowRoot.querySelector('ee-remote-task-list').shadowRoot;
		var sheet = new CSSStyleSheet
		sheet.replaceSync( '.dark.remote-tasks .info, .dark.remote-tasks .task,.dark.remote-tasks .running-time, .dark.remote-tasks iron-icon{ color:#C5C8C6; } .dark.remote-tasks .info .error-message {color: #e34a4a;}'+
			'.dark.remote-tasks .indicator, .dark.remote-tasks .icon{filter: invert();} .dark.remote-tasks .failed .indicator{filter: brightness(1.5);}'+
			'.dark.remote-tasks .task.submitted-to-backend .indicator, .dark.remote-tasks .task.running-on-backend .indicator{filter: invert(1) hue-rotate(180deg) brightness(1.5);transform: rotate(180deg);}'+
			'.dark.remote-tasks earth-gm2-menu-item:hover{background-color:#585858!important}'
			);
		localRoot.adoptedStyleSheets=[...localRoot.adoptedStyleSheets,sheet];
		[...localRoot.children].map(e=>listRoot.push(e))
	}
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
	if(lightIsAutomatic)
		switch2DarkMode(e.matches,true);
});

addModeSwitch();