var portUwM=null;
var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

if(typeof OEEexEscape == 'undefined'){
	OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
		createHTML: (string, sink) => string
	});
}

function setPortUwM(){
	portUwM= chrome.runtime.connect(OEEexidString,{name: "oeel.extension.UwM"});
	portUwM.onDisconnect.addListener(function(port){	
		portUwM=null;
		setPortUwM();
	})

	portUwM.onMessage.addListener((request, sender, sendResponse) => {
		if(request.type=='parallelUpload'){
			maxParallelGSUpload=request.message;
		}
		if(request.type=='parallelDownload'){
			maxParallelDownload=request.message;
		}
	})
}

setPortUwM();


var taskPanel=null;
var GEEUserAssetRoot=null;
maxParallelGSUpload=10;
parallelGSUpload=0;
toGSuploadList=[];

maxParallelDownload=10;
parallelDownload=0;
toDownloadList=[];

var listImAvailable={}
var listImAvailableTime={}

function checkInAvalailable(imName,isPresentCallback,isMissingCallback){
	if (!('Ingesting' in listImAvailableTime)|| listImAvailableTime['Ingesting']+5*60*1000<Date.now()){
		// load ingesting value
		ee.data.listOperations(5000,function(data){
			listImAvailable['Ingesting']=data.filter(e=>e.metadata.type=="INGEST_IMAGE"&&(e.metadata.state=="PENDING"||e.metadata.state=="RUNNING")).map(e=>e.metadata.description.slice(15,-1))
		})
		listImAvailableTime['Ingesting']=Date.now();
	}
	let path=imName.slice(0,imName.lastIndexOf('/'));
	if (!(path in listImAvailableTime)|| listImAvailableTime[path]+5*60*1000<Date.now()){
		let newData =[];
		let loadData=function (nextPageToken){
			let options={pageSize:10000, view:'BASIC'}
			if(nextPageToken)
				options.pageToken=nextPageToken;
			ee.data.listAssets(path, options, function(data){
				newData=[...newData,...(data.assets ? data.assets.map(e=>e.name) : [] )];
				if(('nextPageToken' in data) && data.nextPageToken){
					loadData(data.nextPageToken)
				}else{
					listImAvailable[path]=newData;
				}
			});
		}
		loadData(null);
		listImAvailableTime[path]=Date.now();
	}
	if (!(isPresentCallback||isMissingCallback))
		return;
	let isPresente=false;
	if('Ingesting' in listImAvailable){
		if(listImAvailable['Ingesting'].includes(imName)){
			isPresent=true;
			isPresentCallback();
			return;
		};
	}
	if(path in listImAvailable){
		if(listImAvailable[path].includes(imName)){
			isPresent=true;
			isPresentCallback();
		}else{
			isMissingCallback();
		};
	}else{
		setTimeout(checkInAvalailable,100,imName,isPresentCallback,isMissingCallback);
		// ee.data.getAsset(imName,function(info){
		// 	if(info)
		// 	{
		// 		isPresentCallback();
		// 	}else{
		// 		isMissingCallback();
		// 	}
		// });
	}
}

function simplify_path(main_path) {
	let parts = main_path.split('/'),
	new_path = [],
	length = 0;
	for (var i = 0; i < parts.length; i++) {
		let part = parts[i];
		if (part === '.' || part === '' || part === '..') {
			if (part === '..' && length > 0) {
				length--;
			}
			continue;
		}
		new_path[length++] = part;
	}

	if (length === 0) {
		return '/';
	}

	let result = '';
	for (var i = 0; i < length; i++) {
		result +=  '/'+new_path[i] ;
	}

	return result;
}

function addButtonOnAssetPanel(){
	var topButton=document.querySelector('.top-buttons');
	if(!topButton)
		return;

	icon=document.createElement("iron-icon")
	icon.setAttribute('icon','file-upload');
	divButton=document.createElement("div");
	divButton.setAttribute('class','OEEexUploadButton');
	divButton.appendChild(icon);
	topButton.appendChild(divButton);

	divButton.addEventListener("dragover", function( event ) {divButton.classList.add('dragover'); event.preventDefault();}, false);
	divButton.addEventListener("dragleave", function( event ) {divButton.classList.remove('dragover')}, false);
	divButton.addEventListener("drop", function( event ) {
		event.preventDefault();
		event.stopPropagation();
		divButton.classList.remove('dragover')
		if(event.dataTransfer && event.dataTransfer.files.length) {
			var items  = event.dataTransfer.items;      // -- Items
			for (var i = 0; i < items.length; i++) 
			{
				// Get the dropped item as a 'webkit entry'.
				var entry = items[i].webkitGetAsEntry();
				if(entry.isDirectory)
					uploadTreeFolder(entry)
				if(entry.isFile)
					manageGeoJSON(entry)
			}
		}

	}, false);

	taskPanel=document.querySelector('#task-pane').shadowRoot.querySelector('ee-remote-task-list').shadowRoot.querySelector('.remote-tasks')

}


function uploadTreeFolder(item,path){
	path = path || "";
	var dirReader = item.createReader();
	var fileArray={};
	var readEntries=function(entries) {
		var manifest=null;
		for (var i=0; i<entries.length; i++) {
			if(entries[i].isDirectory)
				uploadTreeFolder(entries[i], path + item.name + "/");
			if(entries[i].isFile){
				if(entries[i].name.toLowerCase()=="manifest.json"){
					manifest=entries[i];
				}else if(entries[i].name.toLowerCase().endsWith('.json') || entries[i].name.toLowerCase().endsWith('.geojson')){
					manageGeoJSON(entries[i]);
				}else{
					fileArray[simplify_path(entries[i].name)]=entries[i];
				}
			}
		}
		if(entries.length==100){
			dirReader.readEntries(readEntries)
		}
		if(manifest)
		{
			uploadFolder(manifest,fileArray);
		}
	}
	dirReader.readEntries(readEntries);
}

function uploadFolder(manifest,fileArray){
	manifest.file(function(manifestFile){
		fr = new FileReader();
		fr.onload = function(e){
			let lines = e.target.result;
			var newArr = JSON.parse(lines);
			if (Array.isArray(newArr)) {
				for (var i = newArr.length - 1; i >= 0; i--) {
					let ue=exploreJson2Upload(newArr[i],fileArray);
					addManifestToIngestInGEE(newArr[i],ue);
				}
			}else{
				let ue=exploreJson2Upload(newArr,fileArray);
				addManifestToIngestInGEE(newArr,ue);
			}
		};
		fr.readAsText(manifestFile);
	});
}


//recursively explore the manifest
function exploreJson2Upload(jsonData,fileArray){
	let array=[];
	if(Array.isArray(jsonData))
	{	
		for (var i = 0; i < jsonData.length; i++) {
			array=array.concat(exploreJson2Upload(jsonData[i],fileArray));
		}
		
	}else{
		if(typeof jsonData==='object') // is dictionary
		{
			if('name' in jsonData)
				checkInAvalailable(jsonData.name,null,null);
			for(k in jsonData){
				if(k=='uris')
					array=array.concat(uploadFilesInGEE(jsonData[k],fileArray));
				else
					array=array.concat(exploreJson2Upload(jsonData[k],fileArray));
			}
		}
	}
	return array;
}

function uploadFilesInGEE(arrayOfUris,fileArray){
	let array=[];
	for (var i = 0; i < arrayOfUris.length; i++) {
		var localIndex=i;
		if(arrayOfUris[localIndex] instanceof Blob){
			array.push(uploadFromBlob(localIndex,arrayOfUris,arrayOfUris[localIndex],true));
			continue;
		}
		if(arrayOfUris[localIndex].startsWith("gs://")) continue;
		if(arrayOfUris[localIndex].startsWith("http://") || arrayOfUris[localIndex].startsWith("https://"))
			array.push(uploadFromRemote(localIndex,arrayOfUris));
		else{
			array.push(uploadFromLocal(localIndex,arrayOfUris,fileArray[simplify_path(arrayOfUris[localIndex])]));
		}
	}
	return array;
}

function getUserRoot(){
	if(!GEEUserAssetRoot){
		GEEUserAssetRoot=ee.data.getAssetRoots()[0].id;	
	}
	return GEEUserAssetRoot;
}

function ingestInGEE(manifest,successCallback,errorCallback){
	projectName=manifest.name.match(/^projects\/(.+)\/assets\//)[1];
	if(!projectName)projectName="earthengine-legacy";
	let ingestCall=new XMLHttpRequest();
	if(manifest.table){
		ingestCall.open("POST",'https://earthengine.googleapis.com/v1alpha/projects/'+projectName+'/table:import',true);
	}
	else{
		ingestCall.open("POST",'https://earthengine.googleapis.com/v1alpha/projects/'+projectName+'/image:import',true);
	}
	
	ingestCall.responseType = 'json';
	ingestCall.onload = function(e) {
		if (this.status == 200) {
			successCallback();
		}
		else{
			if(confirm('Error:'+this.response+'\n Do you want to retry ?'))
			{
				ingestInGEE(manifest,successCallback,errorCallback);
			}
			else{
				errorCallback();
			}
		}
	}
	ingestCall.setRequestHeader("Authorization", ee.data.getAuthToken());

	let reg=/^projects\/(.+)\/assets\/(.*$)/
	let matches=reg.exec(manifest['name']);

	if(!matches || matches.length!=3){
		if(manifest['name'].startsWith('users/') || manifest['name'].startsWith('projects/'))
		{
			manifest['name']='projects/earthengine-legacy/assets/'+manifest['name'];
		}else{
			manifest['name']='projects/earthengine-legacy/assets/'+getUserRoot()+'/'+manifest['name'];
		}
	}


	if(manifest.table){
		delete manifest.table
		ingestCall.send(JSON.stringify({"tableManifest": manifest,
			"requestId": uuidv4(),
					"overwrite": false //maybe doing something for this
				}));
	}else{
		ingestCall.send(JSON.stringify({"imageManifest": manifest,
			"requestId": uuidv4(),
						"overwrite": false //maybe doing something for this
					}));
	}

	
}

function uploadFromLocal(index,uris,fileEntry){
	let uploadImage=new XMLHttpRequest();
	uploadImage.open("GET",'https://code.earthengine.google.com/assets/upload/geturl',true);
	uploadImage.responseType = 'json';
	uploadImage.isLocal=true;
	uploadImage.onload = function(e) {
		if (this.status == 200) {
			let uploadAddresObject=this.response;
			fileEntry.file(function(fileData){
				var uploadFormData = new FormData();
				uploadFormData.append("data", fileData);
				let uploadImageToGS=new XMLHttpRequest();
				uploadImageToGS.open("POST",uploadAddresObject.url,true);
				uploadImageToGS.responseType = 'json';
				uploadImageToGS.onload = function(e) {
					if (this.status == 200) {
						let gsAddress=this.response
						uris[index]=gsAddress[0];
						checkForImediateIngestion(uploadImage.uploadDic);
						checkForGSUpload(true);
					}
				}
				uploadImageToGS.upload.onprogress = (event) => {
					let uploadDelta=event.loaded-uploadImage.alreadyUploaded;
					uploadImage.alreadyUploaded=event.loaded;
					updateDispaly(uploadImage.uploadDic,uploadDelta);
				}
				uploadImageToGS.send(uploadFormData);
			});
		}
	};
	fileEntry.getMetadata(function(metadata) { 
		uploadImage.fileSize=metadata.size;
		uploadImage.alreadyUploaded=0;
	});
	return uploadImage;
}

function uploadFromBlob(index,uris,blob,asZip=false){
	let uploadImage=new XMLHttpRequest();
	uploadImage.open("GET",'https://code.earthengine.google.com/assets/upload/geturl',true);
	uploadImage.responseType = 'json';
	uploadImage.isLocal=false;
	uploadImage.onload = function(e) {
		if (this.status == 200) {
			let uploadAddresObject=this.response;
			var uploadFormData = new FormData();
			if(asZip){
				uploadFormData.append("data", blob,'table.zip');				
			}else{
				uploadFormData.append("data", blob,'uploadImage.tif');
			}
			let uploadImageToGS=new XMLHttpRequest();
			uploadImageToGS.open("POST",uploadAddresObject.url,true);
			uploadImageToGS.responseType = 'json';
			uploadImageToGS.onload = function(e) {
				if (this.status == 200) {
					let gsAddress=this.response
					uris[index]=gsAddress[0];
					checkForImediateIngestion(uploadImage.uploadDic);
					checkForGSUpload(true);
				}
			}
			uploadImageToGS.upload.onprogress = (event) => {
				let uploadDelta=event.loaded-uploadImage.alreadyUploaded;
				uploadImage.alreadyUploaded=event.loaded;
				updateDispaly(uploadImage.uploadDic,uploadDelta);
			}
			uploadImageToGS.send(uploadFormData);
		}
	};
	uploadImage.fileSize=blob.size;
	uploadImage.alreadyUploaded=0;
	return uploadImage;
}

function uploadFromRemote(index,uris){
	let downloadImage=new XMLHttpRequest();
	downloadImage.open("GET",uris[index],true);
	downloadImage.responseType = 'blob';
	downloadImage.onload = function(e) {
		if (this.status == 429) {
			uploadFromRemote(index,uris);
		}
		if (this.status == 200) {
			let downloadObject=this.response;
			let uploadJob=uploadFromBlob(index,uris,new Blob([downloadObject], {type:"multipart/form-data"}));
			uploadJob.uploadDic=downloadImage.uploadDic;
			uploadJob.uploadDic.uploadEvents[uploadJob.uploadDic.uploadEvents.indexOf(downloadImage)]=uploadJob;
			addGSUploadToList(uploadJob,true);
			checkForDownload(true);
		}
	}
	downloadImage.fileSize=Infinity;
	downloadImage.alreadyUploaded=0;
	return downloadImage;
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function addManifestToIngestInGEE(manifest,uploadEvents){
	let divTask=document.createElement("div");
	divTask.classList.add('task');
	divTask.classList.add('legacy');
	divTask.classList.add('type-INGEST_IMAGE');
	let divContent=document.createElement("div");
	divContent.classList.add('content');
	divContent.innerHTML=OEEexEscape.createHTML(manifest.name);
	divTask.appendChild(divContent);
	taskPanel.insertBefore(divTask,taskPanel.firstChild);

	let uploadDic={
		panelTask:divTask,
		manifest:manifest,
		uploadEvents:uploadEvents
	}

	for (var i = uploadEvents.length - 1; i >= 0; i--) {
		uploadEvents[i].uploadDic=uploadDic;
	}
	updateDispaly(uploadDic,0);

	checkInAvalailable(manifest.name,function(){
		uploadDic.panelTask.querySelector('.content').style.background='#ff5722';
	},
	function(){
		for (var i = uploadEvents.length - 1; i >= 0; i--) {
			if(uploadEvents[i].isLocal){
				addGSUploadToList(uploadEvents[i]);
				continue;
			}

			{
				addCommonToDownloadList(uploadEvents[i]);
				continue;
			}
		}
	})
}

function updateDispaly(uploadDic,chunkSize){
	let totalUploaded=0;
	let total2Upload=0;

	for (var i = uploadDic.uploadEvents.length - 1; i >= 0; i--) {
		totalUploaded+=uploadDic.uploadEvents[i].alreadyUploaded;
		total2Upload+=uploadDic.uploadEvents[i].fileSize;
	}

	propUpload=totalUploaded/total2Upload;
	smoothness=chunkSize/total2Upload;

	if(totalUploaded=0){
		uploadDic.panelTask.querySelector('.content').style.background='rgb(180 180 180 / 37%)'
		return;
	}
	if(propUpload>0.999){
		uploadDic.panelTask.querySelector('.content').style.background='#4caf50'
		return;
	}
	{	
		uploadDic.panelTask.querySelector('.content').style.background=
		'linear-gradient(90deg, #4caf50 '+(propUpload-smoothness)*100+
		'%, rgb(180 180 180 / 37%) '+(propUpload+smoothness)*100+'%)';
	}
}

function isReadyToIngest(jsonData){
	var canBeIngested=true;
	if(Array.isArray(jsonData))
	{
		for (var i = 0; i < jsonData.length; i++) {
			canBeIngested&=isReadyToIngest(jsonData[i]);
			if(!canBeIngested)return canBeIngested;
		}
	}else{
		if(typeof jsonData==='object') // is dictionary
		{
			for(k in jsonData){
				if(k=='uris'){
					for (var i = 0; i < jsonData[k].length; i++) {
						if(typeof(jsonData[k][i])!== "string"){
							return false;
						}
						canBeIngested&=jsonData[k][i].startsWith("gs://");
						if(!canBeIngested)return canBeIngested;
					}
				}
				else{
					canBeIngested&=isReadyToIngest(jsonData[k]);
					if(!canBeIngested)return canBeIngested;
				}
			}
		}
	}
	return canBeIngested;
}

function checkForImediateIngestion(uploadDic){
	if(isReadyToIngest(uploadDic.manifest)){
		ingestInGEE(uploadDic.manifest,function(){
			uploadDic.panelTask.remove()
		},function(){
			uploadDic.panelTask.querySelector('.content').style.background='red';
		})
	}
}


function addCommonToDownloadList(upload, toTheFront=false){
	if (toTheFront)
		toDownloadList.unshift(upload);
	else
		toDownloadList.push(upload);
	checkForDownload(false);
}

function checkForDownload(fromPrevious=false){
	if(fromPrevious)parallelDownload--;
	while((toDownloadList.length>0) && (parallelDownload<maxParallelDownload)){
		parallelDownload++;
		toDownloadList[0].send();
		toDownloadList.shift();
	}
}

/*
maxParallelDownload=10;
parallelDownload=0;
toDownloadList=[];
*/

function addGSUploadToList(upload, toTheFront=false){
	if (toTheFront)
		toGSuploadList.unshift(upload);
	else
		toGSuploadList.push(upload);
	checkForGSUpload(false);
}

function checkForGSUpload(fromPrevious=false){
	if(fromPrevious)parallelGSUpload--;
	while((toGSuploadList.length>0) && (parallelGSUpload<maxParallelGSUpload)){
		parallelGSUpload++;
		toGSuploadList[0].send();
		toGSuploadList.shift();
	}
}

setTimeout(addButtonOnAssetPanel,0);

/************** support for GeoJSON ************/

function manageGeoJSON(entrie){
	entrie.file(function(file){
		var reader = new FileReader();
		reader.onloadend = function(e) {
			var result = JSON.parse(this.result);
			
			const observer = new MutationObserver(function(elements){
				elements[0].addedNodes[0].style.visibility='hidden';
				Promise.all(shpwrite.zip(result)).then(function(zipFiles){
					let fileInput=elements[0].addedNodes[0].querySelector('ee-upload-dialog').shadowRoot
					.querySelector('#asset-upload-dialog');
					fileInput.querySelector('#table-advanced-options').shadowRoot.children[1].style.display='none';
					fileInput.shadowRoot.querySelector('h2').innerText='Upload a new GeoJSON asset'
					fileInput.querySelector('#drag-and-drop-field').style.display='none';
					fileInput.querySelector('#asset-id-trailer').shadowRoot.querySelector('#paper-input').value=entrie.name.split('.').slice(0,-1)

					fileInput.shadowRoot.querySelector('.ok-button').disabled=false;
					fileInput.shadowRoot.querySelector('.ok-button').addEventListener('click', function(event) {
						event.stopPropagation();
						// create manifest and submit manifest

						let prop={}

						let propertyList=fileInput.querySelector('#property-list').shadowRoot.querySelectorAll('.property-row');

						propertyList.forEach(function(e){prop[e.querySelector('.property').value]=e.querySelector('.value').value})

						let manifest={
							table:true,
							"name": fileInput.querySelector('#root-id-select').shadowRoot.children[0].shadowRoot.querySelector('#input').innerText+
							fileInput.querySelector('#asset-id-trailer').shadowRoot.querySelector('#paper-input').value,
							"properties": prop,
							"sources": []
						}

						if(prop["system:time_start"]){
							manifest["startTime"]=prop["system:time_start"];
							delete prop["system:time_start"];
						}

						if(prop["system:time_end"]){
							manifest["endTime"]=prop["system:time_end"];
							delete prop["system:time_end"];
						}

						let maxError=fileInput.querySelector('#table-advanced-options').shadowRoot.children[1].querySelector('paper-input').shadowRoot.querySelector('input').value;
						let maxVertices=-1;
						if(fileInput.querySelector('#table-advanced-options').shadowRoot.children[2].querySelector('paper-checkbox').getAttribute('aria-checked')=='true'){
							maxVertices=fileInput.querySelector('#table-advanced-options').shadowRoot.children[3].querySelector('paper-input').shadowRoot.querySelector('input').value;
						}

						for (var i = zipFiles.length - 1; i >= 0; i--) {
							let el={
								"charset": "UTF-8",
								"maxErrorMeters": maxError,
								"uris": [
								zipFiles[i]
								]
							}
							if(maxVertices>0){
								el["maxVertices"]= maxVertices;
							}
							manifest["sources"].push(el);
						}
						console.log(manifest);
						let ue=exploreJson2Upload(manifest,[]);
						addManifestToIngestInGEE(manifest,ue);

						fileInput.shadowRoot.querySelector('.cancel-button').dispatchEvent(new Event('click'))
					}, true);
					elements[0].addedNodes[0].style.removeProperty('visibility');
				})
				
				// Later, you can stop observing
				observer.disconnect();
			});

			// Start observing the target node for configured mutations
			observer.observe(document.querySelector('body'), {childList:true});

			[...document.querySelector("ee-new-asset-menu").shadowRoot.querySelector('ee-menu-button').shadowRoot.querySelectorAll('paper-item')]
			.filter(e=>e.innerText.includes('.shp'))[0].click()

		};
		reader.readAsText(file);
	});
}

