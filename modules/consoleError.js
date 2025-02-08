function loadConsoleErrorWatcher(){

	let rootElement=document.querySelector('.goog-splitpane-second-container ee-tab-panel').shadowRoot
	var sheet = new CSSStyleSheet
	sheet.replaceSync( '.header button.highlight.error,.header button.error { background-color:#ff0000d9 }')
	// Append your style to the existing style sheet.
	rootElement.adoptedStyleSheets=[...rootElement.adoptedStyleSheets,sheet];
	
	let consoleButton = Array.from(rootElement.querySelectorAll('.header button')).find(button => button.innerText === 'Console');

	let consoleElement=document.querySelector('ee-console');
	if(!consoleElement)return;

	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;

	let mut2Error = new MutationObserver(function singleElementObserver(mutationsList){
		for (const mutation of mutationsList) {
			const target = mutation.target;
			if(target.classList.contains('error')){
				consoleButton.classList.add("error")
			}
		}
	});

	let obsForDynamicErrors = { childList: false, attributes:true, subtree: false, attributeFilter: ['class']};
	
	let observerEmptyList          = new MutationObserver(function(mutList){

		[...mutList].map(function(mut){
			if(document.querySelectorAll('ee-console-log').length==0){
				consoleButton.classList.remove("error")
			}
			[...mut.addedNodes].map(function(e){
				if([...Object.getOwnPropertySymbols(e)].some(s=>e[s]=='error')|| (e.parentNode?.classList.contains("error"))){
					consoleButton.classList.add("error")
				}else{
					e.querySelectorAll(".explorer").forEach(item => mut2Error.observe(item, obsForDynamicErrors))
				}
			});
		});
	});
	let obslistChildConfig = { childList: true};
	observerEmptyList.observe(consoleElement, obslistChildConfig);
}

export function initializeMT(){
	loadConsoleErrorWatcher();
}