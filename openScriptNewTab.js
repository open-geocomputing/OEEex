var oee_dbclickScriptTimeout=null;


function addScriptPath(targetNode){


	function constructPath(e,start){
		let parent=e.parentElement.closest('ee-zippy, .zippy')
		if(parent.classList.contains('zippy')){
			// the end of the recursion
			let name=parent.querySelector('.zippy > .header .tree-item-name').innerText;
			return name+':'+start;
		}else{
			// get header
			let name=parent.querySelector('ee-zippy > .header .tree-item-name').innerText;
			//and ast the other part
			return constructPath(parent, name+'/'+start)
		}
	}

	let nodesToExplore=targetNode.map(e=>e.addedNodes[0]).filter(e=> e.classList.contains('file-type-file'));

	nodesToExplore.map(e=>{
		let path=constructPath(e,e.querySelector('.tree-item-name').innerText)
		e.addEventListener('click',event=>{
			if(!event.detail?.timeoutClick){
				event.preventDefault();
				event.stopPropagation();

				if(oee_dbclickScriptTimeout){
					clearTimeout(oee_dbclickScriptTimeout);
					oee_dbclickScriptTimeout=null;
					window.open("https://code.earthengine.google.com/?scriptPath="+encodeURIComponent(path), '_blank')
				}else{
					var event = new CustomEvent("click", {'detail':{'timeoutClick': true}});
					oee_dbclickScriptTimeout=setTimeout(function(){e.dispatchEvent(event)},300)
				}
			}else{
				oee_dbclickScriptTimeout=null;
			}

			
		},true);
	})
}

function addObeserver(){
	let targetNode=document.querySelector(".tree-manager.repo-manager")
	const config = { childList: true, subtree: true };

	// Callback function to execute when mutations are observed
	const callback = (mutationList, observer) => {
		addScriptPath(mutationList)
	};

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(targetNode, config);
}

addObeserver();