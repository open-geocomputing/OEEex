function loadDocWatcher(){
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){
		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if(e.nodeName=="EE-DOCS-POPUP")
				{
					setTimeout(function(){

						let urlname=e[Object.getOwnPropertySymbols(e)[2]].name.replace(/\./g, '-').toLowerCase();
						let docFooterDiv=e.shadowRoot.querySelector("paper-dialog .buttons");
						let externalDocButton=docFooterDiv.querySelector(".external-doc-button")
						console.log(externalDocButton)
						if(!externalDocButton){
							externalDocButton = document.createElement("a");
							externalDocButton.className="external-doc-button"
							externalDocButton.style.fontFamily= "Material Icons"
							externalDocButton.target= '_blank',
							externalDocButton.style.margin="auto 0";
							// Set the text content of the button
							externalDocButton.textContent = 'open_in_new';
							docFooterDiv.insertBefore(externalDocButton, docFooterDiv.firstChild);
							docFooterDiv.style.justifyContent='space-between';
						}
						externalDocButton.href="https://developers.google.com/earth-engine/apidocs/"+urlname;
						console.log(docFooterDiv)
					},0)
					
				}
			});
		});
	});
	let obsConfig = { childList: true};
	
	if(document.querySelector('body'))
		myObserver.observe(document.querySelector('body'), obsConfig);
}

loadDocWatcher();

function addfunctionName(){

	[...new Set([...document.querySelector('ee-docs-list').shadowRoot.querySelectorAll('ee-zippy'),document.querySelector('ee-docs-list').shadowRoot]
		.map((e)=>[...e.querySelectorAll('ee-node-summary')]).flat())].forEach(e=>{
			let span=document.createElement('span');
			span.classList.add('insertInCEButton','material-icons')
			span.innerHTML=OEEexEscape.createHTML("keyboard_tab");
			e.shadowRoot.lastChild.appendChild(span);

			s
		})
}

function loadFunctionSignaturesObserver(){

	const observer = new MutationObserver(function(){
		this.disconnect();
		setTimeout(addfunctionName,0);
	});

	if(document.querySelector('ee-docs-list'))
		observer.observe(document.querySelector('ee-docs-list').shadowRoot, {subtree: true, childList: true});
}
loadFunctionSignaturesObserver();