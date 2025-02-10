import { createAIModel } from "./llm_ai/LLMSFactory.js";

let OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
	createHTML: (string, sink) => string
});


/**** make panel ******/

function enableAiInterface(aiConfig){
	let leftAiTab=addTab(document.querySelector('.goog-splitpane-first-container ee-tab-panel'),"AI",false);
	let rightAiTab=addTab(document.querySelector('.goog-splitpane-second-container ee-tab-panel'),"AI",true);

	rightAiTab.addAiOutput=function(text){
		const div = document.createElement("div");
		div.classList.add("aiResult","animate__zoomInUp")
		div.textContent = text;  
		this.appendChild(div);
		this.show();
	};

	fillFirstAiPanel(leftAiTab,rightAiTab, aiConfig);
}

function addTab(parent,name, hidden=false, selected=false, parm3=false ){
	let localName=name;
	let newTab=document.createElement("ee-tab");
	newTab[Object.getOwnPropertySymbols(newTab)[0]]=selected;
	newTab[Object.getOwnPropertySymbols(newTab)[1]]=hidden;
	newTab[Object.getOwnPropertySymbols(newTab)[2]]=parm3;
	newTab[Object.getOwnPropertySymbols(newTab)[3]]=localName;
	parent.appendChild(newTab);
	parent.shadowRoot.querySelector('.header button.selected').click();
	newTab.hidden=hidden;

	newTab.select=function(){
		this.show();
		[...parent.shadowRoot.querySelectorAll('.header button')].filter(x=> x.innerText==localName)[0].click();
	}

	newTab.show=function(){
		newTab[Object.getOwnPropertySymbols(newTab)[1]]=false;
		parent.shadowRoot.querySelector('.header button.selected').click();
		this.removeAttribute("hidden");
	}

	newTab.hide=function(){
		newTab[Object.getOwnPropertySymbols(newTab)[1]]=true;
		parent.shadowRoot.querySelector('.header button.selected').click();
		this.setAttribute("hidden", "");
	}

	return newTab
}

function generateCollapsibleMenus(rootDiv, dataList, aiConfig) {

	// Clear the root before appending (optional)
	rootDiv.innerHTML = OEEexEscape.createHTML('');

	let insideDiv=document.createElement('div');
	insideDiv.id="aiFirstPanelDiv";

	let controls={};

	dataList.forEach(item => {
	// Create container for each collapsible

	// Create the button (header)
		const btn = document.createElement('button');
		btn.textContent = item.title;

	// Create content
		const content = item.content;
		content.classList.add('content'); // CSS will handle hidden/visible states
		// content.appendChild(item.content);

		// Attach toggle event
		btn.addEventListener('click', () => {
			insideDiv.querySelectorAll(".content").forEach(x => x.classList.remove("show"));
			content.classList.toggle('show');
		});

		// Append button & content to collapsible container
		insideDiv.appendChild(btn);
		insideDiv.appendChild(content);

		controls[item.code]={
			container:content,
			button:btn
		};
	});
	rootDiv.appendChild(insideDiv);

	return controls;
}

function generateCodePanel(leftAiTab,rightAiTab, aiConfig) {
		 // Create the main container
	const container = document.createElement("div");
	container.classList.add("generate-code-panel");

		// Create the instruction paragraph
	const instruction = document.createElement("p");
	instruction.textContent = "Describe the functionality you want in the code:";

		// Create the textarea for user input
	const textArea = document.createElement("textarea");
	textArea.placeholder = "E.g., A code to display the last Sentinel 2 image";

		// Create the generate button
	const generateButton = document.createElement("button");
	generateButton.textContent = "Generate Code";

		// Append elements to the container
	container.appendChild(instruction);
	container.appendChild(textArea);
	container.appendChild(generateButton);

		// Event Listener for future AI-powered code generation
	generateButton.addEventListener("click", () => generateCode(leftAiTab, rightAiTab, textArea.value, aiConfig));
	textArea.addEventListener("keydown", (event) => {
		if (event.shiftKey && event.key === "Enter") {
						event.preventDefault(); // Prevents newline insertion
						generateButton.click();
					}
				});


	return container;
}



function explainCodePanel(leftAiTab,rightAiTab, aiConfig) {
		// Create the main container
	const container = document.createElement("div");
	container.classList.add("explain-code-panel");

		// Create buttons
	const overviewButton = document.createElement("button");
	overviewButton.textContent = "Explain Overall Code";

	const detailedButton = document.createElement("button");
	detailedButton.textContent = "Explain Code Line by Line";

		// Append buttons to the container
	container.appendChild(overviewButton);
	container.appendChild(detailedButton);

		// Event Listeners
	overviewButton.addEventListener("click", () => explainOverview(leftAiTab,rightAiTab, aiConfig));
	detailedButton.addEventListener("click", () => explainDetails(leftAiTab,rightAiTab, aiConfig));

	return container;
}



function alterCodePanel(leftAiTab, rightAiTab, aiConfig) {
// Create the main container
	const container = document.createElement("div");
	container.classList.add("alter-code-panel");

		// Create the instruction paragraph
	const instruction = document.createElement("p");
	instruction.textContent = "Describe how the code should be modified:";

		// Create the textarea for user input
	const textArea = document.createElement("textarea");
	textArea.placeholder = "E.g., Optimize performance, add logging, change function names...";

		// Create the generate button
	const alterButton = document.createElement("button");
	alterButton.textContent = "Modify Code";

		// Append elements to the container
	container.appendChild(instruction);
	container.appendChild(textArea);
	container.appendChild(alterButton);

		// Event Listener for future integration
	alterButton.addEventListener("click", () => modifyCode(leftAiTab, rightAiTab, textArea.value, aiConfig));
	textArea.addEventListener("keydown", (event) => {
		if (event.shiftKey && event.key === "Enter") {
						event.preventDefault(); // Prevents newline insertion
						alterButton.click();
					}
				});


	return container;
}

function fixCodePanel(leftAiTab,rightAiTab, aiConfig) {
		// Create the main container div
	const container = document.createElement("div");
	container.classList.add("fixCode");

		// Create the paragraph section
	const paragraph = document.createElement("p");
	paragraph.textContent = "To do!!";

		// Append elements to the container
	container.appendChild(paragraph);

		// Return the created div
	return container;
}


function fillFirstAiPanel(leftAiTab,rightAiTab, aiConfig){
	const resizeObserver = new ResizeObserver(entries => {
		for (let entry of entries) {
			leftAiTab.style.setProperty('--height', entry.contentRect.height+"px");
		}
	});
	resizeObserver.observe(leftAiTab);

	const sectionTitle = [
		{ code:"generateCode", title: "Generate code", content: generateCodePanel(leftAiTab,rightAiTab, aiConfig)},
		{ code:"explainCode", title: "Explain code", content: explainCodePanel(leftAiTab,rightAiTab, aiConfig) },
		{ code:"alterCode", title: "Code modification", content: alterCodePanel(leftAiTab,rightAiTab, aiConfig) },
		{ code:"fixCode", title: "Fix erors", content: fixCodePanel(leftAiTab,rightAiTab, aiConfig) },
	];
	
	let controls=generateCollapsibleMenus(leftAiTab, sectionTitle);

	if(document.location.search===""){
		controls?.generateCode?.button?.click()
	}else{
		controls?.explainCode?.button?.click()
	}

	document.addEventListener("errorInCode", error => 
	{
		controls?.fixCode?.button?.click()
	})
}

/******** Ai Action  **********/

// Placeholder function for generating code based on user input
function generateCode(leftAiTab, rightAiTab, userRequest, aiConfig) {
	aiConfig.llmiInterface.generateCode(packInformation(aiConfig, userRequest)).then(function(val){
		aiConfig.codeEditor.setValue(val.code);
		rightAiTab.addAiOutput(val.explanation)
	})
}

// Function to explain the overall purpose of the code
function explainOverview(leftAiTab,rightAiTab, aiConfig) {
	aiConfig.llmiInterface.highLevelExplainCode(packInformation(aiConfig)).then(function(val){
		rightAiTab.addAiOutput(val.explanation)
	})
}

// Function to explain the code line by line
function explainDetails(leftAiTab,rightAiTab, aiConfig) {
	aiConfig.llmiInterface.explainCode(packInformation(aiConfig)).then(function(val){
		console.log(val)
		mapAnnotations(aiConfig.codeEditor.getSession(), val.explanations);
	})
}

// Placeholder function for modifying code based on user input
function modifyCode(leftAiTab, rightAiTab, userRequest, aiConfig) {
	aiConfig.llmiInterface.alterCode(packInformation(aiConfig, userRequest)).then(function(val){
		aiConfig.codeEditor.setValue(val.code)
		rightAiTab.addAiOutput(val.explanation)
	})
}


/*** input for the prompt***/

function getErrorsFromConsole(){
	return [...document.querySelectorAll("ee-console-log")].filter(item => item.querySelector(".error") || item.shadowRoot.querySelector(".severity-error")).map(e => e.innerText || e.shadowRoot.textContent).map( t => t.trim());
}

function packInformation(aiConfig, prompt=null){
	let errors=getErrorsFromConsole().join("\n\n");
	let code=aiConfig.codeEditor.getValue();
	let selectedCode=aiConfig.codeEditor.getSelectedText();
	return { prompt, code, selectedCode, errors }
}

/*** display line comment***/

function mapAnnotations(session, annotations) {
    const lines = session.getDocument().getAllLines(); // Get all lines from editor
    const mappedAnnotations = [];

    annotations.forEach(({ comment, code_line }) => {
        const trimmedCode = code_line.trim(); // Remove extra spaces

        if (trimmedCode === "") return; // Ignore empty code lines

        const lineNumber = lines.findIndex(line => line.trim() === trimmedCode); // Match trimmed content

        if (lineNumber !== -1) {
            mappedAnnotations.push({
                row: lineNumber,
                column: 0,
                text: comment,
                type: "info" // Change type if needed
            });
            session.addGutterDecoration(lineNumber,"oeeex-ai-comment")
        }
    });

    session.setAnnotations(mappedAnnotations);
}

function removeCodeAnnotation(editor){
	editor.getSession().on("changeAnnotation", function(){
		let session=editor.getSession();
		for (var i = session.getLength(); i >= 0; i--) {
			session.removeGutterDecoration(i,"oeeex-ai-comment")
		}
	});
}


// autoRemoveAi_comment=false;

// function explainCode(){
	

// 	if(! autoRemoveAi_comment){
// 		autoRemoveAi_comment=true;
// 		editor.getSession().on("changeAnnotation", function(){
// 			let session=editor.getSession();
// 			for (var i = session.getLength(); i >= 0; i--) {
// 				session.removeGutterDecoration(i,"oeeex-ai-comment")
// 			}
// 		});
// 	}



// 	let object={code: editor.getSession().getValue(), header:"",start:0, end:editor.getSession().getLength(), language:aiSettings.AiLanguage}
// 	let selectionRange=editor.getSession().selection.getRange();
// 	if(!((selectionRange.start.row==selectionRange.end.row) && (selectionRange.start.row==selectionRange.end.column ))){
// 		object.start 	=selectionRange.start.row;
// 		object.end 		=selectionRange.end.row+1;
// 	}
// 	sendCodeAndDisplayComment(object);
// 	document.getElementById("oeeex-tool-ai-button").disabled=true;
// }

// let aiTab=null;

/***  error in console ***/

/***  get editor interface ***/

function setEditor(aiConfig){
	let editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		let editor = ace.edit("editor");
		aiConfig.codeEditor=editor;
		removeCodeAnnotation(editor)
	}else{
		setTimeout(setEditor,10,aiConfig)
	}
}

/***  ai config ***/

function createLLMInterface(aiConfig, extensionId){

	document.addEventListener("aiConfig", (event) => {
		// console.log("Received aiConfig:", event.detail);

		// console.log(JSON.stringify(event.detail))
		let selectInterface=event.detail.interface;
		const llmsSetting = {
			interface: selectInterface,
			interfaceParam: event.detail[selectInterface]
		};
		aiConfig.llmiInterface=createAIModel(llmsSetting,extensionId);
	});


	document.dispatchEvent(new Event("requestAiConfig")); // request the config
}

export function initializeMT(extensionId){
	let aiConfig={llmiInterface:null};
	createLLMInterface(aiConfig, extensionId)
	setEditor(aiConfig)
	enableAiInterface(aiConfig);
}

function setLLmConfigCommunication() {
	const storageKey = "aiConfig";

		// Listen for changes in Chrome local storage
	chrome.storage.onChanged.addListener((changes, namespace) => {
		if (changes[storageKey]) {
			const { oldValue, newValue } = changes[storageKey];

						// Perform deep comparison
			if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
				const event = new CustomEvent("aiConfig", { detail: newValue });
				document.dispatchEvent(event);
			}
		}
	});

		// Listen for "requestAiConfig" event and respond with the current aiConfig value
	document.addEventListener("requestAiConfig", () => {
		chrome.storage.local.get([storageKey], (result) => {
			const event = new CustomEvent("aiConfig", { detail: result[storageKey] });
			document.dispatchEvent(event);
		});
	});
	document.dispatchEvent(new Event("requestAiConfig"));
}

export function initialize(extensionId){
	setLLmConfigCommunication()

}