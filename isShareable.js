var currentLocation=window.location.toString();

(function(){
	// based on https://stackoverflow.com/questions/5129386/how-to-detect-when-history-pushstate-and-history-replacestate-are-used
	var createEventOnHistory = function(type) {
		var orig = history[type];
		return function() {
			var rv = orig.apply(this, arguments);
			var e = new Event(type);
			e.arguments = arguments;
			window.dispatchEvent(e);
			return rv;
		};
	};

	history.pushState = createEventOnHistory('pushState'), history.replaceState = createEventOnHistory('replaceState');
})()




// add require if possible
function chekForAssets(){

	let editorElement=document.getElementsByClassName('ace_editor')
	if(editorElement && editorElement.length>0){
		editorElement[0].id='editor'
		var editor = ace.edit("editor");
	}

	let script=editor.getValue();
	let importScript=document.querySelector('.zippy.env-list .body.env-ui').innerText;

	let importScriptMatch=importScript.match(/(users|projects)(\/|[a-zA-Z0-9]|\-|\_)+/g);
	let scriptMatch=script.match(/(users|projects)(\/|[a-zA-Z0-9]|\-|\_)+/g)
	importScriptMatch=(Array.isArray(importScriptMatch)?importScriptMatch:[]);
	scriptMatch=(Array.isArray(scriptMatch)?scriptMatch:[])
	let listAssets=[... new Set([...importScriptMatch,
		...scriptMatch])];

	if(listAssets.length<1){
		return
	}
	//request check of assets

	let getAssetAvailability=new XMLHttpRequest();
	getAssetAvailability.open("POST","https://asset-check-oee.open-geocomputing.org:47850/checkAcces",true);
	getAssetAvailability.setRequestHeader("Content-Type", "application/json");
	getAssetAvailability.responseType = 'json';
	getAssetAvailability.onload = function(e) {
		if (this.status == 200) {
			if(this.response){
				let data=this.response;
				let error=[];
				let warning=[];
				for (const [key, value] of Object.entries(data)) {
					if(value)continue;
					if(importScriptMatch.includes(key)){
						error.push(key);
					}else{
						warning.push(key);
					}
				}
				let message="Some potential asset errors were detected!\n";
				if(error.length>0){
					message+='\n'
					message+="Error: this script contains some assets not publicly shared:\n"
					message+=(" - "+error.join("\n - ")).slice(0,-3)
					message+='\n'
				}
				if(warning.length>0){
					message+='\n'
					message+="Warning: this script may contain some assets not publicly shared:\n"
					message+=(" - "+warning.join("\n - ")).slice(0,-3)
				}
				alert(message)
			}
		}
	}

	getAssetAvailability.send(new URLSearchParams({assetIDs:JSON.stringify(listAssets)}).toString());

}

function locationChangeEvent(e) {
	if(/[0-9A-Fa-f]{32}/g.exec(window.location.pathname)){
		currentLocation=window.location.toString();
		chekForAssets();
		return;
	}
	if(currentLocation==window.location.toString() || window.location.toString()=="https://code.earthengine.google.com/"){
		return;
	}
	
	let match=/\?scriptPath=(.*)\:/g.exec(decodeURIComponent(window.location.search));
	if(match){
		currentLocation=window.location.toString();
		let url="https://code.earthengine.google.com/repo/getacl?repo="+encodeURI(match[1]);
		let getRepoParam=new XMLHttpRequest();
		getRepoParam.open("GET",url,true);
		getRepoParam.responseType = 'json';
		getRepoParam.onload = function(e) {
			if (this.status == 200) {
				if(this.response.all_users_can_read){
					alert('This uses: '+match[1]+', a non public repository!')
				}
			}
		}
		getRepoParam.setRequestHeader("x-xsrf-token", window._ee_flag_initialData.xsrfToken);
		getRepoParam.send();
		chekForAssets();
		return;
	}
}

window.addEventListener('replaceState', locationChangeEvent);
window.addEventListener('pushState', locationChangeEvent);