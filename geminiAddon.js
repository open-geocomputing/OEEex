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
		object.start 	=selectionRange.start.row+1;
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

}
initGeminiAddon();
