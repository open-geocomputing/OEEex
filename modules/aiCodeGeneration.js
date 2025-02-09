import { createAIModel } from "./llm_ai/LLMSFactory.js";

let OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
	createHTML: (string, sink) => string
});

function enableAiInterface(aiConfig){
	let leftAiTab=addTab(document.querySelector('.goog-splitpane-first-container ee-tab-panel'),"AI",false);
	let rightAiTab=addTab(document.querySelector('.goog-splitpane-second-container ee-tab-panel'),"AI",true);

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
		newTab.show();
		[...parent.shadowRoot.querySelectorAll('.header button')].filter(x=> x.innerText==localName)[0].click();
	}

	newTab.show=function(){
		newTab[Object.getOwnPropertySymbols(newTab)[1]]=false;
		parent.shadowRoot.querySelector('.header button.selected').click();
		newTab.hidden=false;
	}

	newTab.hide=function(){
		newTab[Object.getOwnPropertySymbols(newTab)[1]]=true;
		parent.shadowRoot.querySelector('.header button.selected').click();
		newTab.hidden=true;
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

// Placeholder function for generating code based on user input
function generateCode(leftAiTab, rightAiTab, userRequest, aiConfig) {
    aiConfig.llmiInterface.generateCode(userRequest).then(function(val){
    	aiConfig.codeEditor.setValue(val.code);
    	alert(val.explaination)
    })
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

// Function to explain the overall purpose of the code
function explainOverview(leftAiTab,rightAiTab, aiConfig) {
    targetTab.innerText = "Generating an overall explanation of the code...";
    // Call your LLM function here to generate the explanation
}

// Function to explain the code line by line
function explainDetails(leftAiTab,rightAiTab, aiConfig) {
    targetTab.innerText = "Generating a detailed line-by-line explanation...";
    // Call your LLM function here to generate detailed comments
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

// Placeholder function for modifying code based on user input
function modifyCode(leftAiTab, rightAiTab, userRequest, aiConfig) {
    rightAiTab.innerText = `Applying changes: "${userRequest}"...`;
    // Integrate LLM logic here to modify the code
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

function createLLMInterface(extensionId){
	const llmsSetting = {
		interface: "ollama",
		interfaceParam: {
			host: "http://localhost:11434",
			modelVersion: "llama3.2",
			customPrompt: {
				high_level_explain_code: "Briefly summarize what this script accomplishes:\n{code}"
			}
		}
	};

	const aiModel = createAIModel(llmsSetting,extensionId);

	// // Change model dynamically
	// //aiModel.setModelVersion("llama3.3");

	// // Generate code
	// aiModel.generateCode("Write a function to check if a number is prime.")
	// .then(console.log)
	// .catch(console.error);

	// // Get available models
	// aiModel.getAvailableModels()
	// .then(models => console.log("Available models:", models))
	// .catch(console.error);

	return aiModel
}

function setEditor(aiConfig){
	let editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		let editor = ace.edit("editor");
		aiConfig.codeEditor=editor;
	}else{
		setTimeout(setEditor,10,aiConfig)
	}
}

export function initializeMT(extensionId){
	let aiConfig={
		llmiInterface:createLLMInterface(extensionId)
	};
	setEditor(aiConfig)
	enableAiInterface(aiConfig);

}