function injectFunctionSignature(event){
	event.stopPropagation();

	let functionInfo=this.getRootNode().host.__node

	event.stopPropagation();
	let text='';
	for (var i = (functionInfo.isStatic ? 0 : 1); i < functionInfo.signature.args.length; i++) {
		let name=('optional'in functionInfo.signature.args[i] && functionInfo.signature.args[i].optional? '//':'	')
		+'	'+functionInfo.signature.args[i].name+':'
		if('default'in functionInfo.signature.args[i]){
			if(functionInfo.signature.args[i].default==null)
				name+="null";
			else if(functionInfo.signature.args[i].default==true)
				name+="true";
			else if(functionInfo.signature.args[i].default==false)
				name+="false";
			else if(typeof functionInfo.signature.args[i].default ==='string'){
				name+='"'+functionInfo.signature.args[i].default+'"';
			}else{
				name+=functionInfo.signature.args[i].default;
			}
		}
		name+=',\n';
		text+=name;
	}
	if(functionInfo.signature.args.length<(2+!functionInfo.isStatic))
		text=functionInfo.name.slice((functionInfo.isStatic?0:functionInfo.name.lastIndexOf('.')))+'('+text.slice(0,-3)+')';
	else
		text=functionInfo.name.slice((functionInfo.isStatic?0:functionInfo.name.lastIndexOf('.')))+'({\n'+text+'})';
	if(functionInfo.signature.args.length<(1+!functionInfo.isStatic)){
		text=functionInfo.name.slice((functionInfo.isStatic?0:functionInfo.name.lastIndexOf('.')))+'()';
	}
	editor.insert(text);
}

function addFunctionSignaturesButtons(){
	let editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		editor = ace.edit("editor");
	}

	[...new Set([...document.querySelector('ee-docs-list').shadowRoot.querySelectorAll('ee-zippy'),document.querySelector('ee-docs-list').shadowRoot]
	.map((e)=>[...e.querySelectorAll('ee-node-summary')]).flat())].forEach(e=>{
		let span=document.createElement('span');
		span.classList.add('insertInCEButton','material-icons')
		span.innerHTML="keyboard_tab";
		e.shadowRoot.lastChild.appendChild(span);

		span.addEventListener('click',injectFunctionSignature);

		var style = document.createElement('style');
		style.innerText = '.docs-method-header{position:relative;padding-right: 25px;} .docs-method-header span { content:"keyboard_tab"; font-family: "Material Icons"; position: absolute; right: 0px; font-size: 1.5em;} .docs-method-header span:hover{color:#0062ff;}';
		e.shadowRoot.appendChild(style)
	})
}

function loadFunctionSignaturesObserver(){
	let fontLink = document.createElement('link');
	fontLink.type = 'text/css';
	fontLink.rel = 'stylesheet';
	(document.head || document.documentElement).appendChild(fontLink);
	fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons"

	const observer = new MutationObserver(function(){
		this.disconnect();
		setTimeout(addFunctionSignaturesButtons,100);
	});
	let docSection=document.querySelector('ee-docs-list')

	if(docSection!==null)
		observer.observe(docSection.shadowRoot, {subtree: true, childList: true});
	//else
		//setTimeout(loadFunctionSignaturesObserver,1);
}
loadFunctionSignaturesObserver();
