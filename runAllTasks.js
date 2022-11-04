oeex_submitTaskInterval=null;

if(typeof OEEexEscape == 'undefined'){
	OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
		createHTML: (string, sink) => string
	});
}

function addRunAllTaskButton(){
	let taskPanel=document.querySelector('#task-pane').shadowRoot;
	const observer = new MutationObserver(function(mutationsList){
		if(mutationsList.length>0 && mutationsList[0].addedNodes.length>0){
			for (var i = mutationsList[0].addedNodes.length - 1; i >= 0; i--) {
				if(mutationsList[0].addedNodes[i].className=="client-task-pane"){
					let taskPanel=mutationsList[0].addedNodes[i];
					let runAllButton=document.createElement("ee-button")
					runAllButton.classList.add('run-all-button')
					runAllButton.classList.add('run-button')
					runAllButton.setAttribute('type', 'action');
					runAllButton.setAttribute('style', 'height: 0px; right: -4px; float: right; bottom: 30px; position: relative; line-height: 6px; font-weight: 700;');
					runAllButton.innerHTML=OEEexEscape.createHTML("Run all!");
					taskPanel.insertBefore(runAllButton,taskPanel.firstChild);
					runAllButton.addEventListener("click",function(event){
						if(oeex_submitTaskInterval){
							clearInterval(oeex_submitTaskInterval);
							oeex_submitTaskInterval=null;
						}
						oeex_submitTaskInterval=setInterval(function () {
							let disbaledListEvent=[...taskPanel.querySelectorAll('.client-task-list .task ee-button.run-button:not(.run-all-button)[disabled]')];
							let runableEvent=taskPanel.querySelector('.client-task-list .task ee-button.run-button:not(.run-all-button):not([disabled])');
							if(!runableEvent){
								clearInterval(oeex_submitTaskInterval);
								oeex_submitTaskInterval=null;
							}
							if(disbaledListEvent.length<5){
								var event = new Event('click');
								event.metaKey=true;
								if(runableEvent)
									runableEvent.dispatchEvent(event);
							}
						}, 1000);
					})
				}
			}
		}
	});

	observer.observe(taskPanel, {subtree: false, childList: true});
}

addRunAllTaskButton();