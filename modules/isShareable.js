
function checkIfAssetsAreShared(data){
	const params = new URLSearchParams(window.location.search);
	const scriptPath = params.get('scriptPath');

	let allAssetTree={}

	if (scriptPath) {
		const decodedScriptPath = decodeURIComponent(scriptPath);
		data.requires.push(decodedScriptPath)
	}

	data.assets=data.assets.filter(x=> x.args[0].startsWith("projects/"))

	for (var i = data.assets.length - 1; i >= 0; i--) {
		allAssetTree[data.assets[i].args[0]]=checkAssetShareStatus(data.assets[i].args[0]);
	}

	for (var i = data.requires.length - 1; i >= 0; i--) {
		allAssetTree[data.requires[i]]=checkScriptShareStatus(data.requires[i]);
	}

	Promise.all(Object.values(allAssetTree))
	.then(results => {
		// Map results back to their keys
		let responseData = {};
		let index = 0;
		for (const key in allAssetTree) {
			responseData[key] = results[index++];
		}

		// Now/ all data is available, process accordingly
		displayCheckStatus(responseData);
	})
	.catch(error => console.error("Error in requests:", error));

	
}

function displayCheckStatus(data){
	console.log(data)
	console.log(JSON.stringify(data))

    if (!data || Object.keys(data).length === 0) {
        return; // If data is empty, do nothing
    }

    let nonSharedItems = Object.entries(data)
        .filter(([_, value]) => !value.all_users_can_read)
        .map(([key]) => key);

    if (nonSharedItems.length === 0) {
        return; // If all items are shared, do nothing
    }

    // Create the popup container
    const popup = document.createElement('div');
    popup.className = 'oeeSCSContainer visible'; // Reuse context menu styling
    document.body.appendChild(popup);

    // Generate list items
    const itemList = nonSharedItems.map(item => `<li>${item}</li>`).join('');

    // Add content to the popup
    popup.innerHTML = `        
        <p class="title"><b>⚠️ Some assets are not shared ⚠️</b></p>
        <ul>${itemList}</ul>
        <button id="shareAllButton">Share All</button>
        <button id="closePopup">Close</button>
    `;

    // Event listener for the "Share All" button
    document.getElementById('shareAllButton').addEventListener('click', function () {
        shareMissingAssets(nonSharedItems); // Function to be implemented later
        document.body.removeChild(popup);
    });

    // Event listener for the "Close" button
    document.getElementById('closePopup').addEventListener('click', function () {
        document.body.removeChild(popup);
    });

    // Prevent clicks inside the popup from closing it
    popup.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });

    // Close popup on outside click
    document.addEventListener('mousedown', (event) => {
        if (!popup.contains(event.target)) {
            document.body.removeChild(popup);
        }
    });

    // Close popup on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.body.removeChild(popup);
        }
    });
}

function shareMissingAssets(nonSharedItems){
	let repos=nonSharedItems.filter(x => x.includes(":"))
	let assets=nonSharedItems.filter(x => !x.includes(":"))
	repos=[...new Set(repos.map(x => x.split(":")[0] ))]
	console.log(repos,assets)
	repos.map( item =>{
		[...document.querySelectorAll(".repos-container > div")].filter( x => x.querySelector(".tree-item-name").innerText==item)[0].querySelector(".config-button.button").click()
	})
}


function checkScriptShareStatus(path){
	let repoPath=path.split(":")[0];
	return fetch("https://code.earthengine.google.com/repo/getacl?repo="+encodeURIComponent(repoPath),{
		headers: {
			"x-xsrf-token": window._ee_flag_initialData.xsrfToken
		}
	}).then(response => response.json())
}

function checkAssetShareStatus(path){
	return new Promise((resolve, reject) => {
		try {
      // If myFunction supports a callback (async mode)
			ee.data.getAssetAcl(path, (result, error) => {
				if (error) reject(error);
				else resolve(result);
			});
		} catch (error) {
      // If myFunction runs synchronously and throws an error
			reject(error);
		}
	});
}

function setListener(worker){

	let editorElement=document.getElementsByClassName('ace_editor')
	if(! (editorElement && editorElement.length>0)){
		setTimeout(setListener,10,worker);
		return;	
	}
	editorElement[0].id='editor'
	let editor = ace.edit("editor");

	let checkAssets=function(){
		console.log("send to webWorker")
		worker.postMessage(editor.getValue());
	}

	document.querySelector("#tool-bar-link-button").addEventListener("click",checkAssets)
	document.querySelector("#tool-bar-link-button").nextSibling.addEventListener("click",function(){
		document.getElementById(":i").addEventListener("click",checkAssets)
		document.getElementById(":k").addEventListener("click",checkAssets)
	});
}

function loadWorker(extensionId){
	fetch("chrome-extension://"+extensionId+"/otherAssets/sherableCheck.js")
	.then(response => response.text())
	.then(scriptText => {
		const blob = new Blob([scriptText], { type: "application/javascript" });
		const workerURL = URL.createObjectURL(blob);
		const worker = new Worker(workerURL);

		// Cleanup when done
		worker.onmessage = (event) => {
			checkIfAssetsAreShared(event.data)
		};
		
		setListener(worker);
		
		
	})
	.catch(error => console.error("Error loading worker script:", error));
}

export function initializeMT(extensionId){
	loadWorker(extensionId);
}
