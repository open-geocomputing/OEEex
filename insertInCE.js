function addInsertCEButton(obj,title,lib,editor,isConstructor){
	let span=document.createElement('span');
	span.classList.add('insertInCEButton','material-icons')
	span.innerHTML="keyboard_tab"
	span.addEventListener('click',function(event){
		event.stopPropagation();
		let text=title+'({\n'
		for (var i = (isConstructor?0: 1); i < lib.arguments.length; i++) {
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
		if(lib.arguments.length<2){
			text=title+'()';
		}
		editor.insert(text)
	})
	obj.appendChild(span);
}

function getAllDocObject(libSignatures){

	let editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		var editor = ace.edit("editor");
	}


	let allSignatures={}
	for (var i = libSignatures['algorithms'].length - 1; i >= 0; i--) {
		allSignatures[libSignatures['algorithms'][i].name]=libSignatures['algorithms'][i];
	}
	let docList=document.querySelector('.docs-list .main-section')
	docList.querySelectorAll('.docs-method-header.constructor').forEach(e=>{
		let signature='algorithms/'+(e.innerText.split('(')[0]).slice(3);
		if(signature in allSignatures)
			addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,true);
	})
	docList.querySelectorAll('.docs-method-header:not(.constructor)').forEach(e=>{
		let signature='algorithms/'+(e.parentNode.parentNode.firstChild.innerText+'.'+e.innerText.split('(')[0]).slice(3);
		if(signature in allSignatures)
			addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);
		else
		{
			signature='algorithms/'+(e.innerText.split('(')[0]).slice(3);
			if(signature in allSignatures)
				addInsertCEButton(e,e.innerText.split('(')[0],allSignatures[signature],editor,false);

		}

	})
}


function loadFunctionSignatures(observer){
	this.disconnect();
	let loadSignature=new XMLHttpRequest();
	loadSignature.open("GET",'https://content-earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/algorithms?prettyPrint=false',true);
	loadSignature.responseType = 'json';
	loadSignature.onload = function(e) {
		if (this.status == 200) {
			getAllDocObject(this.response);
		}
	}
	loadSignature.setRequestHeader("Authorization", ee.data.getAuthToken());
	loadSignature.send();

	// let loadSignature=new XMLHttpRequest();
	// loadSignature.open("GET",'https://code.earthengine.google.com/docs/get',true);
	// loadSignature.responseType = 'json';
	// loadSignature.onload = function(e) {
	// 	if (this.status == 200) {
	// 		getAllDocObject(this.response);
	// 	}
		
	// }
	// //loadSignature.setRequestHeader("Authorization", ee.data.getAuthToken());
	// loadSignature.send();
}

(function(){
	const observer = new MutationObserver(loadFunctionSignatures);
	observer.observe(document.querySelector('.docs-list .main-section'), {subtree: true, childList: true});
})()
