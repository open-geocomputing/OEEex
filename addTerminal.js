if(typeof OEEexEscapeURL == 'undefined'){
	OEEexEscapeURL = trustedTypes.createPolicy("OEEexEscapeURL", {
		createScriptURL: (string, sink) => string
	});
}

if(typeof OEEexEscape == 'undefined'){
	OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
		createHTML: (string, sink) => string
	});
}

function sendCodeFromEditor2Terminal(){};

function loadConsoleTerminalWatcher(){
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){

		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if(e.classList.contains('OEEexTerminalAnalysis'))
					return;
				e.classList.add('OEEexTerminalAnalysis')
				analysisTerminalAddon(e)
			});
		});
	});
	let obsConfig = { childList: true};

	document.addEventListener('keydown',function(event) {
		if(/*(event.metaKey) &&*/ event.which == 116) {
			sendCodeFromEditor2Terminal();
		}
	});
	
	if(document.querySelector('ee-console'))
		myObserver.observe(document.querySelector('ee-console'), obsConfig);
}

function analysisTerminalAddon(val){

	val.querySelectorAll('.ui-widget.ui-textbox').forEach(function(obj){
		let input=obj.querySelector('input');
		if(input.placeholder==">>"){
			input.placeholder="";
			obj.parentNode.classList.add("OEEexTerminal")
			let s=document.createElement("span");
			s.textContent=">>";
			obj.parentNode.insertBefore(s,obj);
		}

		// add F5 shortcut
		let editorElement=document.getElementsByClassName('ace_editor');
		if(editorElement && editorElement.length>0){
			editorElement[0].id='editor'
			editor = ace.edit("editor");
		}
		let current="";
		let historyCmd=[""];
		let postionHitory=0;

		input.addEventListener('change', (event) => {
			historyCmd[0]=event.target.value;
			if(historyCmd[0]!="") historyCmd.unshift("");
		},true);

		sendCodeFromEditor2Terminal=function(){
			input.value=editor.getSelectedText().replaceAll("\n","\\n");
			input.dispatchEvent(new Event('change'));
		}

		input.addEventListener('keydown',function(event) {
			let skip=false;
			if(event.which == 13){
				input.dispatchEvent(new Event('change'));
			}
			if( event.which == 38 && historyCmd.length>0) {//up
				postionHitory=(++postionHitory>=historyCmd.length?historyCmd.length-1:postionHitory);
				skip=true;
			}
			if( event.which == 40 && historyCmd.length>0) {// down
				postionHitory=(--postionHitory<0?0:postionHitory);
				skip=true;
			}
			if(skip){
				input.value=historyCmd[postionHitory];
				input.selectionEnd = historyCmd[postionHitory].length;
				input.selectionStart = historyCmd[postionHitory].length;
			}else{
				historyCmd[0]=input.value;
			}
		});
	});
}

loadConsoleTerminalWatcher();