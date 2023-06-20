function loadConsoleErrorWatcher(){

	let rootElement=document.querySelector('.goog-splitpane-second-container ee-tab-panel').shadowRoot
	var sheet = new CSSStyleSheet
	sheet.replaceSync( '.header button.highlight.error,.header button.error { background-color:#ff0000d9 }')
	// Append your style to the existing style sheet.
	rootElement.adoptedStyleSheets=[...rootElement.adoptedStyleSheets,sheet];
	
	let consoleButton = Array.from(rootElement.querySelectorAll('.header button')).find(button => button.innerText === 'Console');

	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){

		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if([...Object.getOwnPropertySymbols(e)].some(s=>e[s]=='error')|| (e.parentNode?.classList.contains("error"))){
					consoleButton.classList.add("error")
				}
			});
			if(document.querySelectorAll('ee-console-log').length==0){
				consoleButton.classList.remove("error")
			}
		});
	});
	let obsConfig = { childList: true, attributes:true, subtree: true};
	
	if(document.querySelector('ee-console'))
		myObserver.observe(document.querySelector('ee-console'), obsConfig);
}

loadConsoleErrorWatcher();