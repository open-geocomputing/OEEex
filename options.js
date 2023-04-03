listOfScript=['isShareable',
	'insertInCE',
	'planetLab',
	'uploadWithManifest',
	'hackEE',
	'EEDarkMode',
	'addCommandS',
	'oeelCache',
	'addPlotly',
	'openScriptNewTab',
	'editorSettings',
	'addCopyJSON',
	'aiCodeGeneration'
];

var lightIsAutomatic=true;

var portWithBackground=null;
function setPortWithBackground(){
	portWithBackground= chrome.runtime.connect({name: "oeel.extension.lightMode"});
	portWithBackground.onDisconnect.addListener(function(port){ 
		portWithBackground=null;
		setPortWithBackground();
	})

	portWithBackground.onMessage.addListener((request,
		 sender,
		 sendResponse) => {
		if(request.type=='changeLightMode'){
			if(request.message=='automatic'){
				if((typeof buttonLight!= 'undefined') && buttonLight)
					buttonLight.innerHTML='brightness_medium';
				switch2DarkMode((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches),
						true)
			}else{
				switch2DarkMode(request.message,
						false);
			}
		};
	})
}

setPortWithBackground();


function runOnceLoaded(){
	// const logoPlayer = document.querySelector("#logo");
	// //logoPlayer.setDirection(1);
	// logoPlayer.play();

	for (var i = listOfScript.length - 1; i >= 0; i--) {
		document.querySelector('.'+listOfScript[i]).classList.add('available');
	}
}

function updateStatus(){
	chrome.storage.local.get(listOfScript,
		 function(result){
		for(let key in result)
			setSatus(key,
					result[key],
				true)
	});
}

function setModuleStatus(){  
	document.querySelectorAll('.lock').forEach((e)=>
		e.addEventListener('click',
				function(){
			let superParentNode=e.parentNode.parentNode.parentNode;
			let className=([...superParentNode.classList].filter(value => listOfScript.includes(value)))[0];
			let newKey={};
			newKey[className]=superParentNode.classList.contains('off');
			chrome.storage.local.set(newKey);
			//updateStatus();
			setSatus(className,
					newKey[className],
				false)
		}
		));
}

function setSatus(key,
		value,
	isInit){
	if(!(listOfScript.includes(key)))
		return;
	let element=document.querySelector('.'+key);
	let player=element.querySelector('.lock lottie-player');
	player.autoplay=false;

	if(value){
		element.classList.remove('off');
		player.setDirection(1);
		player.play();
	}else{
		element.classList.add('off');
		if (!isInit) {
			player.setDirection(-1);
			player.play();
		}
	}
}

chrome.storage.onChanged.addListener(function(dic){
	for( let idx in listOfScript)
	{
		let key=listOfScript[idx];
		if(key in dic){
			setSatus(key,
					dic[key]['newValue']);
		}
	}
});



function setLight(){
	var lightModeElement=document.querySelector('.lightMode');
	lightModeElement.querySelector('span.isAutomatic').addEventListener('click',
			function(){
		sendNewlightMode('automatic');
	});
	lightModeElement.querySelector('span.isDark').addEventListener('click',
			function(){
		sendNewlightMode(true);
	});
	lightModeElement.querySelector('span.isLight').addEventListener('click',
			function(){
		sendNewlightMode(false);
	});
}

function switch2DarkMode(toDark,
		isAuto=false){
	lightIsAutomatic=isAuto;
	if (toDark){
		document.getElementsByTagName('html')[0].classList.add('dark');
	}
	else{
		document.getElementsByTagName('html')[0].classList.remove('dark');
	}

	var lightModeElement=document.querySelector('.lightMode');
	lightModeElement.querySelectorAll('span').forEach((e)=>e.classList.remove('active'))

	if(lightIsAutomatic){
		lightModeElement.querySelector('span.isAutomatic').classList.add('active');
	}else{
		if(toDark)
			lightModeElement.querySelector('span.isDark').classList.add('active');
		else
			lightModeElement.querySelector('span.isLight').classList.add('active');
	}
};

window.addEventListener("load",
	 function(){
	portWithBackground.postMessage({type:"getLightMode"});
});

function sendNewlightMode(mode){
	portWithBackground.postMessage({type:"setLightMode",
		 message:mode});
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',
	 e => {
	if(lightIsAutomatic)
		switch2DarkMode(e.matches,
				true);
});

// manifestUpload


function setManifestUploadParam(dic){
	if('parallelUpload' in dic){
		let value=dic['parallelUpload'];
		if(typeof value === 'object' && 'newValue' in value)value=value['newValue'];
		document.getElementById('parallelUpload').value=value;
		document.getElementById('parallelUpload').dispatchEvent(new Event('input'));
	}
	if('parallelDownload' in dic){
		let value=dic['parallelDownload'];
		if(typeof value === 'object' && 'newValue' in value) value=value['newValue'];
		document.getElementById('parallelDownload').value=value;
		document.getElementById('parallelDownload').dispatchEvent(new Event('input'));
	}
}

chrome.storage.onChanged.addListener(setManifestUploadParam);

function saveNewManifestParam(event=false){
	chrome.storage.local.set({parallelUpload:parseInt(document.getElementById('parallelUpload').value),

		parallelDownload:parseInt(document.getElementById('parallelDownload').value)});
}

document.getElementById('parallelUpload').addEventListener('change',
		saveNewManifestParam);
document.getElementById('parallelDownload').addEventListener('change',
		saveNewManifestParam);

chrome.storage.local.get(['parallelUpload',
		'parallelDownload'],
	setManifestUploadParam);

/**
 * adapted from Lalit Patel
 * Website: http://www.lalit.org/lab/javascript-css-font-detect/
 */

function listMonospaceFonts() {

	let array=['Bitstream Vera Sans Mono','Courier','Consolas','DejaVu Sans Mono','Lucida Console','Menlo','Monaco','PT Mono','Roboto Mono','source-code-pro','Ubuntu Mono']

    // a font will be compared against all the three default fonts.
    // and if it doesn't match all 3 then that font is not available.
    var baseFonts = ['monospace', 'sans-serif', 'serif'];

    //we use m or w because these two characters take up the maximum width.
    // And we use a LLi so that the same matching fonts can get separated
    var testString = "mmmmmmmmmmlli";

    //we test using 72px font size, we may use any size. I guess larger the better.
    var testSize = '72px';

    var h = document.getElementsByTagName("body")[0];

    // create a SPAN in the document to get the width of the text we use to test
    var s = document.createElement("span");
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    var defaultWidth = {};
    var defaultHeight = {};
    for (var index in baseFonts) {
        //get the default width for the three base fonts
        s.style.fontFamily = baseFonts[index];
        h.appendChild(s);
        defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font
        defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
        h.removeChild(s);
    }

    function detect(font) {
        var detected = false;
        for (var index in baseFonts) {
            s.style.fontFamily = font + ',' + baseFonts[index]; // name of the font along with the base font for fallback.
            h.appendChild(s);
            var matched = (s.offsetWidth != defaultWidth[baseFonts[index]] || s.offsetHeight != defaultHeight[baseFonts[index]]);
            h.removeChild(s);
            detected = detected || matched;
        }
        return detected;
    }

    return array.filter(f=> detect(f))
};

function initES(){

	(function(){
		let selector=document.querySelector('#fontFamily');
		let listFont=listMonospaceFonts().map(fontName=>selector.appendChild(new Option(fontName, fontName)))
	})()

	chrome.storage.local.get(['ESfontSize','ESfontFamily'],
		function(data){
			if (data.ESfontSize) {document.querySelector('#fontSize').setAttribute('value',data.ESfontSize);}
			if (data.ESfontFamily) {document.querySelector('#fontFamily').value=data.ESfontFamily;}
		});

	document.querySelector('#fontSize').addEventListener('change',function(event){chrome.storage.local.set({ESfontSize:event.target.value});});
	document.querySelector('#fontFamily').addEventListener('change',function(event){chrome.storage.local.set({ESfontFamily:event.target.value})});
}


//init
initES();
runOnceLoaded();
setLight();
setModuleStatus();
updateStatus();


function makeRangeDisplay(idObject){
	let rangeV = document.getElementById(idObject);
	let range=rangeV.parentNode.querySelector('input');

	let setValue = ()=>{
		newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),

		newPosition = 10 - (newValue * 0.2);
		rangeV.innerHTML = `<span>${range.value}</span>`;
		rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
	};
	setValue()
	range.addEventListener('input',
		 setValue);
}


makeRangeDisplay('rangeParallelUpload');
makeRangeDisplay('rangeParallelDownload');

//planet

var planetApiV=2;


makeRangeDisplay('rangePlanetBatchSize');
makeRangeDisplay('rangePlanetParallelActivation');

/******* value *******/


chrome.storage.onChanged.addListener(setPlanetConfig);

function setPlanetConfig(dic){
	if('planetConfig' in dic){
		openAIParam=dic['planetConfig'];
		if('newValue' in openAIParam) openAIParam=openAIParam['newValue'];
		document.getElementById('planetApiKey').value=openAIParam["apiKey"];
		document.getElementById('PlanetPathInGEE').value=openAIParam["collectionPath"];
		document.getElementById('PlanetThumbnail').checked=openAIParam["Thumbnail"];
		planetApiV=openAIParam["apiVersion"];
		document.getElementById('planetApiOptions').classList=['v'+planetApiV];
		document.querySelectorAll('.planetApi.button').forEach((e)=>e.classList.add('is-outlined'));
		document.querySelectorAll('.planetApi.button').forEach((e)=>e.classList.add('is-outlined'));
		document.querySelector('.planetApi.button.v'+planetApiV).classList.remove('is-outlined');
		document.querySelector('input[name="PlanetBandNaming"][value='+openAIParam["bandNomenclature"]+']').checked=true;;
		document.getElementById('PlanetBatchSize').value=openAIParam["batchSize"];
		document.getElementById('PlanetBatchSize').dispatchEvent(new Event('input'));
		document.getElementById('PlanetParallelActivation').value=openAIParam["maxParallelActivation"];
		document.getElementById('PlanetParallelActivation').dispatchEvent(new Event('input'));
		document.getElementById('PlanetServiceAccount').value=openAIParam["serviceAccount"];

		document.querySelector('.content.planetLab.available').classList.remove('somethingMissing');
		if(!openAIParam["apiKey"] || !openAIParam["collectionPath"] || !openAIParam["apiVersion"] ){
			document.querySelector('.content.planetLab.available').classList.add('somethingMissing');
		}
	}
}

function constructPlanetConfig(){
	return{
		apiKey:document.getElementById('planetApiKey').value,

		collectionPath:document.getElementById('PlanetPathInGEE').value,

		Thumbnail:document.getElementById('PlanetThumbnail').checked,

		apiVersion:planetApiV,

		bandNomenclature:document.querySelector('input[name="PlanetBandNaming"]:checked').value,

		batchSize:parseInt(document.getElementById('PlanetBatchSize').value),

		maxParallelActivation:parseInt(document.getElementById('PlanetParallelActivation').value),

		serviceAccount:document.getElementById('PlanetServiceAccount').value
	}
}

function saveNewPlanetParam(event=false){
	chrome.storage.local.set({planetConfig:constructPlanetConfig()});
}

function addPlanetListner(){

	chrome.storage.local.get(['planetConfig'],
			setPlanetConfig);
	// login
	document.getElementById('planetLogin').addEventListener('click',
			function(){
		var body={"email": document.getElementById('planetEmail').value,
			 "password": document.getElementById('planetPwd').value}
		let getKeyFromLogin=new XMLHttpRequest();
		getKeyFromLogin.open("POST",
				'https://api.planet.com/auth/v1/experimental/public/users/authenticate',
			true);
		getKeyFromLogin.responseType = 'json';
		getKeyFromLogin.setRequestHeader("Content-Type",
			 "application/json");
		getKeyFromLogin.onload = function(e) {
			if (this.status == 200) {
				let planetCredential=JSON.parse(atob(this.response.token.split('.')[1]));
				document.getElementById('planetApiKey').value=planetCredential.api_key;
				saveNewPlanetParam();
				return;
			}
			if (this.status >=400) {
				document.getElementById('planetEmail').classList.add('wrong');
				document.getElementById('planetPwd').classList.add('wrong');
				return;
			}
		}
		getKeyFromLogin.send(JSON.stringify(body));
	});

	let removeWrong=function(){
		document.getElementById('planetEmail').classList.remove('wrong');
		document.getElementById('planetPwd').classList.remove('wrong');
	}
	document.getElementById('planetEmail').addEventListener('input',
			removeWrong);
	document.getElementById('planetPwd').addEventListener('input',
			removeWrong);
	// end login

	document.getElementById('planetApiKey').addEventListener('change',
			saveNewPlanetParam);
	document.getElementById('PlanetPathInGEE').addEventListener('change',
			saveNewPlanetParam);
	document.getElementById('PlanetThumbnail').addEventListener('change',
			saveNewPlanetParam);
	document.getElementById('PlanetBatchSize').addEventListener('change',
			saveNewPlanetParam);
	document.getElementById('PlanetParallelActivation').addEventListener('change',
			saveNewPlanetParam);
	document.getElementById('PlanetServiceAccount').addEventListener('change',
			saveNewPlanetParam);
	document.querySelectorAll('input[name="PlanetBandNaming"]').forEach((e)=>e.addEventListener('change',
			saveNewPlanetParam));

	document.querySelector('.planetApi.button.v1').addEventListener('click',
			function(){
		planetApiV=1;
		saveNewPlanetParam();
	})
	document.querySelector('.planetApi.button.v2').addEventListener('click',
			function(){
		planetApiV=2;
		saveNewPlanetParam();
	}) 
}

addPlanetListner();

//OpenAI


chrome.storage.onChanged.addListener(setOpenAIConfig);

function setOpenAIConfig(dic){
	if('openAIConfig' in dic){
		openAIParam=dic['openAIConfig'];
		if('newValue' in openAIParam) openAIParam=openAIParam['newValue'];
		document.getElementById('openAIApiKey').value=openAIParam["apiKey"];
		
		document.querySelector('.content.aiCodeGeneration.available').classList.remove('somethingMissing');
		if( !openAIParam["apiKey"] ){
			document.querySelector('.content.aiCodeGeneration.available').classList.add('somethingMissing');
		}
	}
}

function constructOpenAIConfig(){
	return{
		apiKey:document.getElementById('openAIApiKey').value,
	}
}

function saveNewOpenAIParam(event=false){
	chrome.storage.local.set({openAIConfig:constructOpenAIConfig()});
}

function addOpenAIListner(){

	chrome.storage.local.get(['openAIConfig'],setOpenAIConfig);
	document.getElementById('openAIApiKey').addEventListener('change', saveNewOpenAIParam);
}

addOpenAIListner();