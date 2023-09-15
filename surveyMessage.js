var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

if(typeof OEEexEscapeURL == 'undefined'){
    OEEexEscapeURL = trustedTypes.createPolicy("OEEexEscapeURL", {
        createScriptURL: (string, sink) => string
    });
}

if(typeof OEEexEscape == 'undefined'){
    OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
        createHTML: (string, sink) => string
    });
}

window.addEventListener("load", function(){
    if(typeof(promptPythonCEExtensionPrefix)=="undefined") return
    var s = document.createElement('script');
    s.src = OEEexEscapeURL.createScriptURL('chrome-extension://'+OEEexidString+'/3rd_party/lottie-player.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    //document.querySelector("button.goog-button.reset-button").click()
    let message=document.querySelector("ee-console").shadowRoot.querySelector(".intro-message");
    if(message){
        message.innerHTML=OEEexEscape.createHTML('<strong>You\'ve successfully activated Python for your code editor</strong>\
            <lottie-player hover loop src="chrome-extension://'+OEEexidString+'/images/logo.json" mode="bounce" autoplay="true" id="logo" background="transparent"  speed="0.5"  style="width: 70px; height: 70px;float: right; margin-left:5px" ></lottie-player>\
            <br>To begin, we invite you to navigate to the <a  target="_blank"  href="https://www.open-geocomputing.org/OEEex/#Python" style="color: hsl(120deg 100% 31%); font-weight: bold;">feature page</a> where you\'ll find multiple examples to review. It would also be beneficial for you to familiarize yourself with any known limitations.\
            <br>Keep in mind, this feature is still in its experimental🧪 phase! Your understanding and participation in its development are much appreciated. If you stumble upon any bugs, please report them on the extension\'s <a  target="_blank"  href="https://github.com/open-geocomputing/OEEex/issues" style="color: hsl(120deg 100% 31%); font-weight: bold;">Github issues page</a>.')
        message.style.background='linear-gradient(to top right, hsl(244deg 59% 55% / 50%) 10%, hsl(274deg 91% 79% / 50%))';
        message.style.borderRadius= '7px';
        message.style.padding= '7px';
        message.style.textAlign= 'justify';
    }
});

window.addEventListener("load", function(){
    let start=new Date('2022-12-13');
    let end=new Date('2022-12-23');
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
        message.innerHTML=OEEexEscape.createHTML('<strong>Open Earth Engine Toolbox Annual Survey</strong>\
            <lottie-player hover loop src="chrome-extension://'+OEEexidString+'/images/logo.json" mode="bounce" autoplay="true" id="logo" background="transparent"  speed="0.5"  style="width: 70px; height: 70px;float: right; margin-left:5px" ></lottie-player>\
            <br>The end of the year is close, and it\'s time for a small <a target="_blank" href="https://forms.gle/rKfSgF1zJ5NWhCMb6" style="color: hsl(120deg 100% 31%); font-weight: bold;">survey</a>. Please let us know about your experience with the Open Earth Engine Library and extension. ')
        message.style.background='linear-gradient(to top right, hsl(244deg 59% 55% / 50%) 10%, hsl(274deg 91% 79% / 50%))';
        message.style.borderRadius= '5px';
        message.style.paddingLeft= '5px';
    }
});