
async function sendCodeAndDisplayComment(theCode) {
  try {
    const response = await fetch('https://oeeex-ai-assistant.open-geocomputing.org/code/explain/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({code: theCode}),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const jsonData = await response.json();
    displayAIComment(jsonData);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    document.getElementById("oeeex-tool-ai-button").disabled=false;
  }
}

function displayAIComment(json){
	localJson=json;
	json=json.filter((item) => item["comment"]!=="");
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

	let theCode=editor.getSession().getValue();
	sendCodeAndDisplayComment(theCode);
	document.getElementById("oeeex-tool-ai-button").disabled=true;
}

function initGeminiAddon(){

	let getLinkButton=document.querySelector("#tool-bar-link-button");
	let aiButton=document.createElement("button");
	aiButton.classList.add("goog-button");
	aiButton.title="Gemini-help"
	aiButton.id="oeeex-tool-ai-button"
	aiButton.innerHTML=OEEexEscape.createHTML('<span >🤔</span>')

	getLinkButton.parentNode.insertBefore(aiButton, getLinkButton);
	aiButton.classList.add("oeeex-ai-button");

	aiButton.addEventListener("click",explainCode)
}
initGeminiAddon();
