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
	});
}

loadConsoleTerminalWatcher();