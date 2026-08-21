
var OEEexidString=chrome.runtime.id

function pythonMessage(){
    var s = document.createElement('script');
    s.src = 'chrome-extension://'+OEEexidString+'/3rd_party/lottie-player.js';
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    //document.querySelector("button.goog-button.reset-button").click()
    let message=document.querySelector("ee-console").shadowRoot.querySelector(".intro-message");
    if(message){
        message.innerHTML=('<strong>You\'ve successfully activated Python for your code editor</strong>\
            <lottie-player hover loop src="chrome-extension://'+OEEexidString+'/images/logo.json" mode="bounce" autoplay="true" id="logo" background="transparent"  speed="0.5"  style="width: 70px; height: 70px;float: right; margin-left:5px" ></lottie-player>\
            <br>To begin, we invite you to navigate to the <a  target="_blank"  href="https://www.open-geocomputing.org/OEEex/#Python" style="color: hsl(120deg 100% 31%); font-weight: bold;">feature page</a> where you\'ll find multiple examples to review. It would also be beneficial for you to familiarize yourself with any known limitations.\
            <br>Keep in mind, this feature is still in its experimental🧪 phase! Your understanding and participation in its development are much appreciated. If you stumble upon any bugs, please report them on the extension\'s <a  target="_blank"  href="https://github.com/open-geocomputing/OEEex/issues" style="color: hsl(120deg 100% 31%); font-weight: bold;">Github issues page</a>.')
        message.style.background='linear-gradient(to top right, hsl(244deg 59% 55% / 50%) 10%, hsl(274deg 91% 79% / 50%))';
        message.style.borderRadius= '7px';
        message.style.padding= '7px';
        message.style.textAlign= 'justify';
    }
}

function surveyMessage(){
    let start=new Date('2024-01-23');
    let end=new Date('2024-03-23');
    let now=new Date()
    if(!((start< now) && (now< end)))return;
    var s = document.createElement('script');
    s.src = 'chrome-extension://'+OEEexidString+'/3rd_party/lottie-player.js';
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    //document.querySelector("button.goog-button.reset-button").click()
    let message=document.querySelector("ee-console").shadowRoot.querySelector(".intro-message");
    if(message){
        message.innerHTML=('<strong>Open Earth Engine Toolbox Annual Survey</strong>\
            <lottie-player hover loop src="chrome-extension://'+OEEexidString+'/images/logo.json" mode="bounce" autoplay="true" id="logo" background="transparent"  speed="0.5"  style="width: 70px; height: 70px;float: right; margin-left:5px" ></lottie-player>\
            <br>The end of the year is close, and it\'s time for a small <a target="_blank" href="https://forms.gle/MXWpPssxpH5pXQyE9" style="color: hsl(120deg 100% 31%); font-weight: bold;">survey</a>. Please let us know about your experience with the Open Earth Engine Library and extension. ')
        message.style.background='linear-gradient(to top right, hsl(244deg 59% 55% / 50%) 10%, hsl(274deg 91% 79% / 50%))';
        message.style.borderRadius= '5px';
        message.style.paddingLeft= '5px';
    }
}

function v2Message(){
    let start=new Date('2025-01-23');
    let end=new Date('2025-03-23');
    let now=new Date()
    if(!((start< now) && (now< end)))return;
    var s = document.createElement('script');
    s.src = 'chrome-extension://'+OEEexidString+'/3rd_party/lottie-player.js';
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    //document.querySelector("button.goog-button.reset-button").click()
    let message=document.querySelector("ee-console").shadowRoot.querySelector(".intro-message");
    if(message){
        message.innerHTML=('<strong style="font-size:1.15em">🚀 Open Earth Engine Toolbox V2 is Here! 🎉</strong>\
            <br>\
            <lottie-player hover loop src="chrome-extension://'+OEEexidString+'/images/logo.json" mode="bounce" autoplay="true" id="logo" background="transparent" speed="0.5" style="width: 70px; height: 70px; float: right; margin-left: 5px"></lottie-player>\
            <br>We’re thrilled to introduce <strong>Open Earth Engine Toolbox V2</strong>, packed with new improvements, an integrated <strong>AI feature 🤖</strong>, and a <strong>complete background redesign</strong> to boost performance and reduce crashes! ⚡🚀\
            <br>If you come across any issues or bugs, please report them on our <a target="_blank" href="https://github.com/open-geocomputing/OEEex/issues" style="color: hsl(0deg 100% 40%); font-weight: bold;">GitHub issues page</a> 🛠️🔍.\
        ')
        message.style.background='linear-gradient(to top right, hsl(244deg 59% 55% / 50%) 10%, hsl(274deg 91% 79% / 50%))';
        message.style.borderRadius= '5px';
        message.style.paddingLeft= '5px';
    }
}

export async function earthEngineStudioMessage(){
    let availability;
    try {
        const response=await fetch('https://code.earthengine.studio/availability.json');
        if(!response.ok)return;
        availability=await response.json();
    } catch (_error) {
        return;
    }

    if(availability.phase !== 'general-availability')return;

    var s = document.createElement('script');
    s.src = 'chrome-extension://'+OEEexidString+'/3rd_party/lottie-player.js';
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);

    let consoleElement=document.querySelector("ee-console");
    let message=consoleElement && consoleElement.shadowRoot && consoleElement.shadowRoot.querySelector(".intro-message");
    if(message){
        message.innerHTML=('<strong style="font-size:1.15em">Try Earth Engine Studio</strong>\
            <lottie-player hover loop src="https://www.earthengine.studio/assets/images/brand/earthengine-studio-logo.json" autoplay="true" background="transparent" speed="0.5" style="width: 90px; height: 90px; float: right; margin-left: 8px"></lottie-player>\
            <br>The extension is becoming harder and harder to maintain. I propose replacing the complete interface with <strong>Earth Engine Studio</strong>.\
            <br><a target="_blank" href="http://www.earthengine.studio/" style="color: hsl(120deg 100% 31%); font-weight: bold;">Try Earth Engine Studio</a> and let me know what you think.')
        message.style.background='linear-gradient(to top right, hsl(244deg 59% 55% / 50%) 10%, hsl(274deg 91% 79% / 50%))';
        message.style.borderRadius='7px';
        message.style.padding='7px';
        message.style.textAlign='justify';
    }
}


export function initialize(){
	chrome.storage.local.get(["pythonCE"],function(r){
		if(r["pythonCE"]) window.addEventListener("load",pythonMessage)
	})
	window.addEventListener("load",surveyMessage);
    window.addEventListener("load",v2Message);
    window.addEventListener("load",earthEngineStudioMessage);
}
