if(typeof OEEexEscape == 'undefined'){
	OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
		createHTML: (string, sink) => string
	});
}

function initAiCodeGeneration(){
	var editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		editor = ace.edit("editor");
	}


	let getLinkButton=document.querySelector("#tool-bar-link-button");
	let aiButton=document.createElement("button");
	aiButton.classList.add("goog-button");
	aiButton.title="Start AI code generator (OpenAI)"
	aiButton.id="oeeex-tool-ai-button"
	aiButton.innerHTML=OEEexEscape.createHTML('<span class="material-icons">tips_and_updates</span>')

	getLinkButton.parentNode.insertBefore(aiButton, getLinkButton);
	aiButton.classList.add("ai-button");

	aiButton.addEventListener("click",openAiAssistanceInterface)

	document.addEventListener('keydown',function(event) {
		let aiElement=document.querySelector("#oeeex_AI_assistance")
		if(event.which == 27 && aiElement) {
			aiElement.parentNode.removeChild(aiElement);
			event.preventDefault();
			return false;
		}
	});

}

function openAiAssistanceInterface(){
	let body=document.querySelector('body');
	let diagContainer=document.createElement("div");
	let diag=document.createElement("div");
	diagContainer.id="oeeex_AI_assistance"
	diagContainer.classList.add("oeeex","diag");
	diagContainer.classList.add("container");
	diag.classList.add("content");

	let bg=document.createElement("img");
	bg.src="https://www.svgrepo.com/download/306500/openai.svg"

	let bg_div=document.createElement("div");
	bg_div.classList.add("logo");

	let mainDiv=document.createElement("div");
	mainDiv.classList.add("mainDiv");

	let header=document.createElement("div");
	header.classList.add("header");
	header.innerHTML=OEEexEscape.createHTML('<h2>AI Assistance</h2><br>powered by OpenAI');

	let textarea=document.createElement("textarea");
	textarea.classList.add("requestBox");

	if(!(editor.getValue) || editor.getValue().length<1){
	 	textarea.value="Generate a Google Earth Engine javascript code that";
	}

	let errorBox=document.createElement("div");
	errorBox.textContent="\u00A0";
	errorBox.classList.add("errorBox");

	let submit=document.createElement("button");
	submit.textContent="Do it!"
	submit.classList.add("submit");

	let cancel=document.createElement("button");
	cancel.textContent="Cancel"
	cancel.classList.add("cancel");

	

	cancel.addEventListener('click',function(event) {
		body.removeChild(diagContainer);
	});

	submit.addEventListener('click',function(event) {
		if (textarea.value.length<1){
			alert("Please provide clear instruction!")
			return;
		}

		let oaiURL='https://api.openai.com/';

		let aiObject={
			model: "code-davinci-edit-001",
			instruction:textarea.value,
			temperature:0
		}

		if(editor.getValue().length>0)
			aiObject.input=editor.getValue();

		let aiRequest=new XMLHttpRequest();
		aiRequest.open("POST",oaiURL+"v1/edits");
		aiRequest.responseType = 'json';
		aiRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		aiRequest.onload = function(e) {
			diag.classList.remove("running");
			textarea.disabled=false;
			if (this.status == 200) {
				editor.setValue(this.response.choices[0].text);
				body.removeChild(diagContainer);
			}
			if (this.response && this.response.error) {
				errorBox.textContent="Error: "+this.response.error.message;
			}
			
		}
		aiRequest.onerror = function(e) {
			diag.classList.remove("running");
			textarea.disabled=false;
			if (this.response && this.response.error) {
				errorBox.textContent="Error: "+this.response.error.message;
			}
		}
		aiRequest.send(JSON.stringify(aiObject));
		diag.classList.add("running");
		textarea.disabled=true;
		errorBox.textContent="\u00A0";
	});

	bg_div.appendChild(bg)
	diag.appendChild(bg_div)
	mainDiv.appendChild(header)
	mainDiv.appendChild(document.createElement("hr"))
	mainDiv.appendChild(textarea)
	mainDiv.appendChild(document.createElement("hr"))
	mainDiv.appendChild(submit)
	mainDiv.appendChild(cancel)
	mainDiv.appendChild(errorBox)
	diag.appendChild(mainDiv)
	
	diagContainer.appendChild(diag)
	body.appendChild(diagContainer)

	textarea.focus();
}



initAiCodeGeneration();

