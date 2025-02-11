import { createAIModel } from "./llm_ai/LLMSFactory.js";

let OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
	createHTML: (string, sink) => string
});

let OEEexEscapeURL = trustedTypes.createPolicy("OEEexEscapeURL", {
	createScriptURL: (string, sink) => string
});


function injectMarked(extensionId){
	var s = document.createElement('script');
	s.src = OEEexEscapeURL.createScriptURL("chrome-extension://"+extensionId+"/3rd_party/marked.min.js");
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
}

/**** make panel ******/

function enableAiInterface(aiConfig){
	let leftAiTab=addTab(document.querySelector('.goog-splitpane-first-container ee-tab-panel'),"AI",false);
	let rightAiTab=addTab(document.querySelector('.goog-splitpane-second-container ee-tab-panel'),"AI",true);

	rightAiTab.addAiOutput=function(text){
		const div = document.createElement("div");
		div.classList.add("aiResult","animate__zoomInUp")
		div.innerHTML = OEEexEscape.createHTML(marked.parse(text));  
		this.appendChild(div);
		this.show();
	};

	fillFirstAiPanel(leftAiTab,rightAiTab, aiConfig);
	aiConfig.leftAiTab=leftAiTab;
	aiConfig.rightAiTab=rightAiTab;
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
	let request=packInformation(aiConfig, userRequest)
	aiConfig.llmiInterface.alterCode(request).then(function(val){
		aiConfig.codeEditor.setValue(updateCodeFromDiff(val, request.code, aiConfig.codeEditor.getValue()))
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

/**** apply diff*****/

function updateCodeFromDiff(diffObj, originalCode, currentCode) {
    let patch = diffObj.patch;
    if (!patch || patch.trim() === "") {
	    	if (patch.startsWith("```") && str.endsWith("```")) {
					patch = patch.slice(3, -3); // Remove first and last 3 characters
				}
        // Compute patch between originalCode and diffObj.code if patch is empty
        patch = Diff.createPatch("filename", originalCode, diffObj.code, "", "");
    }
    const newCode = Diff.applyPatch(currentCode, patch);
    return newCode;
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

/***  error in console ***/


async function sendErrorAndCodeAndDisplayComment(errorMessage, button, message, aiConfig) {
	let request=packInformation(aiConfig, "")
	request.errors=[message];
	aiConfig.llmiInterface.fixCode(request).then(function(val){
		displayAiErrorHelpMessage(errorMessage, val, request, aiConfig);
	})
}

function displayAiErrorHelpMessage(e,jsonData,request,aiConfig){
	let advice=jsonData?.explanation
	let aiAnswerMessageDiv=document.createElement("div");
	aiAnswerMessageDiv.classList.add("aiAnswer");
	aiAnswerMessageDiv.innerHTML="<b>AI Assistance</b><br>"+marked.parse(advice);
	aiAnswerMessageDiv.classList.add("animate__zoomInDown")
	
	if(jsonData?.patch){

		let updateButton=document.createElement("span");
		updateButton.innerText='🔄';
		updateButton.classList.add("updateCode");
		aiAnswerMessageDiv.insertBefore(updateButton,aiAnswerMessageDiv.firstChild);
		updateButton.addEventListener('click',function(){
			console.log(jsonData, request.code, aiConfig.codeEditor.getValue())
			console.log(updateCodeFromDiff(jsonData, request.code, aiConfig.codeEditor.getValue()))
			aiConfig.codeEditor.setValue(updateCodeFromDiff(jsonData, request.code, aiConfig.codeEditor.getValue()))
		})
	}

	e.appendChild(aiAnswerMessageDiv);
	e.removeChild(e.querySelector(".aiButton"))
}

function addErrorButon(e, message, aiConfig){
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
	.message.severity-error .summary{\
		padding-right: 27px;\
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
		text-shadow: 0 0 0px white;\
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
	.updateCode{\
	  position: relative;\
	  font-size: 1.4em;\
    float: right;\
     top: -5px;\
    right: -2px;\
	}\
	");
	e.shadowRoot.adoptedStyleSheets=[...e.shadowRoot.adoptedStyleSheets,sheet];
	let errorMessage=e.shadowRoot.querySelector(".message.severity-error");
	if(errorMessage){
		let aiButton=document.createElement("span");
		aiButton.classList.add("aiButton");
		aiButton.textContent="✨";
		errorMessage.appendChild(aiButton);
		aiButton.addEventListener("click",function(){
			if(aiButton.classList.contains("disabled"))
				return;
			aiButton.classList.add("disabled");
			sendErrorAndCodeAndDisplayComment(errorMessage, aiButton, message, aiConfig)
		})
	}
}

function addConsoleErrorObeserver(aiConfig){
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){
		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if(e.classList.contains('OEEexAIErrorHelper'))
					return;
				e.classList.add('OEEexAIErrorHelper');
				if(e[Object.getOwnPropertySymbols(e)[1]]=='error'){
					setTimeout(addErrorButon,0,e,e[Object.getOwnPropertySymbols(e)[0]],aiConfig);
				}
			});
		});
	});
	let obsConfig = { childList: true};
	
	if(document.querySelector('ee-console'))
		myObserver.observe(document.querySelector('ee-console'), obsConfig);
}

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
			customPrompt:event.detail?.customPromptsEnabled,
			language:event.detail?.language,
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
	addConsoleErrorObeserver(aiConfig);
	injectMarked(extensionId);
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
	setLLmConfigCommunication();
}