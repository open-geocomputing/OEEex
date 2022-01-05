function addInsertCEButton(obj,title,lib,editor,isConstructor){
	let span=document.createElement('span');
	span.classList.add('insertInCEButton','material-icons')
	span.innerHTML="keyboard_tab";
	if('arguments' in lib)
		span.addEventListener('click',function(event){
			event.stopPropagation();
			let text=title+'({\n'
			for (var i = (isConstructor ? 0 : 1); i < lib.arguments.length; i++) {
				let name=('optional'in lib.arguments[i] && lib.arguments[i].optional? '//':'	')
				+'	'+lib.arguments[i].argumentName+':'
				if('defaultValue'in lib.arguments[i]){
					if(lib.arguments[i].defaultValue==null)
						name+="null";
					else if(lib.arguments[i].defaultValue==true)
						name+="true";
					else if(lib.arguments[i].defaultValue==false)
						name+="false";
					else if(typeof lib.arguments[i].defaultValue ==='string'){
						name+='"'+lib.arguments[i].defaultValue+'"';
					}else{
						name+=lib.arguments[i].defaultValue;
					}
				}
				name+=',\n';
				text+=name;
			}
			text+='})'
			if(lib.arguments.length<(1+!isConstructor)){
				text=title+'()';
			}
			editor.insert(text)
		})
	else
		span.addEventListener('click',function(event){
			event.stopPropagation();
			let text=title+'({\n'
			for (var i = (isConstructor ? 0 : 1); i < lib.args.length; i++) {
				let name=('optional'in lib.args[i] && lib.args[i].optional? '//':'	')
				+'	'+lib.args[i].name+':'
				if(lib.args[i].type=="Function"){
					name+='function(arg){}'
				}
				name+=',\n';
				text+=name;
			}
			text+='})'
			if(lib.args.length<(1+!isConstructor)){
				text=title+'()';
			}
			editor.insert(text)
		})
	obj.appendChild(span);
	obj.classList.add('OEEenhanced');
}

function getAllDocObject(allSignatures){

	let editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		var editor = ace.edit("editor");
	}

	let docList=document.querySelector('.docs-list .main-section')
	docList.querySelectorAll('.docs-method-header.constructor:not(.OEEenhanced)').forEach(e=>{
		let signature='algorithms/'+(e.innerText.split('(')[0]).slice(3);
		if(signature in allSignatures)
		{
			addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,true);
			return;
		}
		{
			signature=(e.parentNode.parentNode.firstChild.innerText+'.prototype.'+e.innerText.split('(')[0])
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,true);
				return;
			}
			signature="playground.api."+signature;
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,true);
				return;
			}
		}

		{
			signature=e.innerText.split('(')[0];
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,true);
				return;
			}
			signature="playground.api."+signature;
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,true);
				return;
			}
		}
	})
	docList.querySelectorAll('.docs-method-header:not(.constructor):not(.OEEenhanced)').forEach(e=>{
		let signature='algorithms/'+(e.parentNode.parentNode.firstChild.innerText+'.'+e.innerText.split('(')[0]).slice(3);
		if(signature in allSignatures)
		{
			addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
			return;
		}
		else
		{
			signature=e.innerText.split('(')[0];
			if(signature.startsWith('ee.Algorithms.'))
				signature=signature.slice('ee.Algorithms.'.length);
			if(signature.startsWith('ee.'))
				signature=signature.slice(3);
			signature='algorithms/'+signature;
			if(signature in allSignatures)
			{
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}

		{
			signature='algorithms/Geometry.'+e.innerText.split('(')[0];
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}

		{
			signature='algorithms/reduce.'+e.innerText.split('(')[0];
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}

		{
			signature='algorithms/Collection.'+e.innerText.split('(')[0];
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}


		{
			signature='algorithms/Element.'+e.innerText.split('(')[0];
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}

		{
			signature='algorithms/Window.'+e.innerText.split('(')[0];
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}

		if(e.innerText.split('(')[0].startsWith('aggregate_')){
			signature='algorithms/AggregateFeatureCollection.'+e.innerText.split('(')[0].slice('aggregate_'.length);
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}

		{
			signature=(e.parentNode.parentNode.firstChild.innerText+'.prototype.'+e.innerText.split('(')[0])
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
			signature="playground.api."+signature;
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}

		{
			signature=e.innerText.split('(')[0];
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
			signature="playground.api."+signature;
			if(signature in allSignatures){
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
				return;
			}
		}
	})
}


function loadFunctionSignatures(observer){
	this.disconnect();
	
	let loadSignature2=new XMLHttpRequest();
	loadSignature2.open("GET",'https://code.earthengine.google.com/docs/get',true);
	loadSignature2.responseType = 'json';
	loadSignature2.onload = function(e) {
		if (this.status == 200) {
			getAllDocObject(this.response);
		}
		
	}
	//loadSignature.setRequestHeader("Authorization", ee.data.getAuthToken());
	

	let loadSignature=new XMLHttpRequest();
	loadSignature.open("GET",'https://content-earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/algorithms?prettyPrint=false',true);
	loadSignature.responseType = 'json';
	loadSignature.onload = function(e) {
		if (this.status == 200) {
			let libSignatures=this.response;
			let allSignatures={}
			for (var i = libSignatures['algorithms'].length - 1; i >= 0; i--) {
				allSignatures[libSignatures['algorithms'][i].name]=libSignatures['algorithms'][i];
			}
			loadSignature2.send();
			getAllDocObject(allSignatures);
		}
	}
	loadSignature.setRequestHeader("Authorization", ee.data.getAuthToken());
	loadSignature.send();

	
}

(function(){
	let fontLink = document.createElement('link');
	fontLink.type = 'text/css';
	fontLink.rel = 'stylesheet';
	(document.head || document.documentElement).appendChild(fontLink);
	fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons"

	const observer = new MutationObserver(loadFunctionSignatures);
	observer.observe(document.querySelector('.docs-list .main-section'), {subtree: true, childList: true});
})()
