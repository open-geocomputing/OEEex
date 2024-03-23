var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

let aiSettings=null;

if(typeof OEEexEscape == 'undefined'){
	OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
		createHTML: (string, sink) => string
	});
}

function setPortWithBackground(){
	portWithBackground= chrome.runtime.connect(OEEexidString,{name: "oeel.extension.AiSettings"});
	

	portWithBackground.onMessage.addListener((request, sender, sendResponse) => {
		if(request.type=='AiSettings'){
			aiSettings=request.message;
		};
	})
	portWithBackground.onDisconnect.addListener(function(port){	
		portWithBackground=null;
		setPortWithBackground();
	})

	portWithBackground.postMessage({type:"getParameters"});
}

setPortWithBackground();


async function sendCodeAndDisplayComment(requestObject) {
	
	try {
		const response = await fetch('https://oeeex-ai-assistant.open-geocomputing.org/code/explain/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestObject),
		});
		
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		
		aiTab.show();
		const jsonData = await response.json();
		displayAIComment(jsonData);

	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
		document.getElementById("oeeex-tool-ai-button").disabled=false;
	}
}

function displayAIComment(json){
	
	localJson=json;
	json=localJson["commentArray"].filter((item) => item["comment"]!=="");
	let session=editor.getSession();
	session.setAnnotations(json.map((item) => ({
		row: item["line"]-1,
		text: item["comment"],
		type: "info"
	})))
	for (var i = json.length - 1; i >= 0; i--) {
		session.addGutterDecoration(json[i]["line"]-1,"oeeex-ai-comment")
	}

	document.getElementById("oeeex-tool-ai-button").disabled=false;

	//aiTab.innerHTML = '';

	infoBox=document.createElement('div');

	if(infoBox){
		infoBox.innerHTML=OEEexEscape.createHTML('<strong>Gemini assistance</strong>\
				<br>'+localJson["overallDescription"])
		infoBox.classList.add("oeeexAIInfo","animate__zoomInUp")
	}
	aiTab.appendChild(infoBox)

	aiTab.select();
}

autoRemoveAi_comment=false;

function explainCode(){
	
	if(typeof(editor)=="undefined"){
		let editorElement=document.getElementsByClassName('ace_editor')
		if(typeof(editor)=="undefined" && editorElement && editorElement.length>0){
			editorElement[0].id='editor'
			editor = ace.edit("editor");
		}
	}

	if(! autoRemoveAi_comment){
		autoRemoveAi_comment=true;
		editor.getSession().on("changeAnnotation", function(){
			let session=editor.getSession();
			for (var i = session.getLength(); i >= 0; i--) {
				session.removeGutterDecoration(i,"oeeex-ai-comment")
			}
		});
	}



	let object={code: editor.getSession().getValue(), header:"",start:0, end:editor.getSession().getLength(), language:aiSettings.AiLanguage}
	let selectionRange=editor.getSession().selection.getRange();
	if(!((selectionRange.start.row==selectionRange.end.row) && (selectionRange.start.row==selectionRange.end.column ))){
		object.start 	=selectionRange.start.row;
		object.end 		=selectionRange.end.row+1;
	}
	sendCodeAndDisplayComment(object);
	document.getElementById("oeeex-tool-ai-button").disabled=true;
}

let aiTab=null;

function addTab(name, hidden=false, selected=false, parm3=false ){
	let localName=name;
	let newTab=document.createElement("ee-tab");
	let panel=document.querySelector('.goog-splitpane-second-container ee-tab-panel');
	newTab[Object.getOwnPropertySymbols(newTab)[0]]=selected;
	newTab[Object.getOwnPropertySymbols(newTab)[1]]=hidden;
	newTab[Object.getOwnPropertySymbols(newTab)[2]]=parm3;
	newTab[Object.getOwnPropertySymbols(newTab)[3]]=localName;
	panel.appendChild(newTab);
	newTab.hidden=hidden;

	newTab.select=function(){
		[...panel.shadowRoot.querySelectorAll('.header button')].filter(x=> x.innerText==localName)[0].click();
		newTab.hidden=true;
		newTab.hidden=false;
	}

	newTab.show=function(){
		newTab[Object.getOwnPropertySymbols(newTab)[1]]=false;
		panel.shadowRoot.querySelector('.header button.selected').click();
		newTab.hidden=true;
		newTab.hidden=false;
	}

	newTab.hide=function(){
		newTab[Object.getOwnPropertySymbols(newTab)[1]]=true;
		panel.shadowRoot.querySelector('.header button.selected').click();
		newTab.hidden=true;
	}

	return newTab
}

async function sendErrorAndCodeAndDisplayComment(errorMessage,button,requestObject) {
	console.log( JSON.stringify(requestObject))
	try {
		const response = await fetch('https://oeeex-ai-assistant.open-geocomputing.org/error/explain/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestObject),
		});
		
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		
		aiTab.show();
		const jsonData = await response.json();
		displayAiErrorHelpMessage(errorMessage,jsonData);

	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
		button.classList.remove("disabled");
	}
}

function displayAiErrorHelpMessage(e,jsonData){
	let advice=jsonData['adviceOnError']
	aiAnswerMessageDiv=document.createElement("div");
	aiAnswerMessageDiv.classList.add("aiAnswer");
	aiAnswerMessageDiv.innerHTML="<b>Gemini Assistance</b><br>"+advice;
	aiAnswerMessageDiv.classList.add("animate__zoomInDown")
	e.appendChild(aiAnswerMessageDiv);
	e.removeChild(e.querySelector(".aiButton"))
}

function addErrorButon(e, message){

	const sheet = new CSSStyleSheet();
	// Apply a rule to the sheet
	sheet.replaceSync("@keyframes zoomInDown {\
		from {\
			opacity: 0;\
			-webkit-transform: scale3d(0.1, 0.1, 0.1) translate3d(0, -1000px, 0);\
			transform: scale3d(0.1, 0.1, 0.1) translate3d(0, -1000px, 0);\
			-webkit-animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);\
			animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);\
		}\
	\
		60% {\
			opacity: 1;\
			-webkit-transform: scale3d(0.475, 0.475, 0.475) translate3d(0, 60px, 0);\
			transform: scale3d(0.475, 0.475, 0.475) translate3d(0, 60px, 0);\
			-webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);\
			animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);\
		}\
	}\
	.animate__zoomInDown {\
		-webkit-animation-name: zoomInDown;\
		animation-name: zoomInDown;\
	}\
	.aiButton{\
		position: relative;\
		float: right;\
		right: -4px;\
		bottom: -4px;\
		padding: 2px 5px 4px 3px;\
		border-top-left-radius: 4px;\
		border-right: none;\
		border-bottom: none;\
		border: 2px white solid;\
		user-select: none;\
		font-size: 1.3em;\
		margin-top: -25px;\
	}\
\
	.aiButton.disabled {\
	   filter: grayscale(1);\
	}\
	.aiAnswer{\
		background: linear-gradient(to right top, rgba(82, 73, 208, 0.5) 10%, rgba(208, 153, 250, 0.5));\
		border-radius: 5px;\
		padding-left: 13px;\
		padding: 5px;\
		margin: 2px;\
		text-align: justify;\
		animation-duration: 0.3s;\
	}\
	");
	e.shadowRoot.adoptedStyleSheets=[...e.shadowRoot.adoptedStyleSheets,sheet];
	let errorMessage=e.shadowRoot.querySelector(".message.severity-error");
	if(errorMessage){
		aiButton=document.createElement("span");
		aiButton.classList.add("aiButton");
		aiButton.textContent="🤔";
		errorMessage.appendChild(aiButton);
		errorMessage.addEventListener("click",function(){
			if(aiButton.classList.contains("disabled"))
				return;
			aiButton.classList.add("disabled");
			let object={code: editor.getSession().getValue(), header:"",error:message, language:aiSettings.AiLanguage}
			sendErrorAndCodeAndDisplayComment(errorMessage,aiButton,object)
		})
	}
}

function addConsoleErrorObeserver(){
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){
		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if(e.classList.contains('OEEexAIErrorHelper'))
					return;
				e.classList.add('OEEexAIErrorHelper');
				if(e[Object.getOwnPropertySymbols(e)[1]]=='error'){
					setTimeout(addErrorButon,0,e,e[Object.getOwnPropertySymbols(e)[0]]);
				}
			});
		});
	});
	let obsConfig = { childList: true};
	
	if(document.querySelector('ee-console'))
		myObserver.observe(document.querySelector('ee-console'), obsConfig);
}


function initGeminiAddon(){

	let getLinkButton=document.querySelector("#tool-bar-link-button");
	let aiButton=document.createElement("button");
	aiButton.classList.add("goog-button");
	aiButton.title="Gemini-help";
	aiButton.id="oeeex-tool-ai-button";
	aiButton.innerHTML=OEEexEscape.createHTML('<span >🤔</span>');

	getLinkButton.parentNode.insertBefore(aiButton, getLinkButton);
	aiButton.classList.add("oeeex-ai-button");

	aiButton.addEventListener("click",explainCode);

	aiTab=addTab("AI",true);
	addConsoleErrorObeserver();

}
initGeminiAddon();



