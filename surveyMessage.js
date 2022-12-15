var OEEexidString=document.currentScript.src.match("([a-z]{32})")[0];
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
        message.innerHTML='<strong>Open Earth Engine Toolbox Annual Survey</strong>\
            <lottie-player hover loop src="chrome-extension://'+OEEexidString+'/images/logo.json" mode="bounce" autoplay="true" id="logo" background="transparent"  speed="0.5"  style="width: 70px; height: 70px;float: right; margin-left:5px" ></lottie-player>\
            <br>The end of the year is close, and it\'s time for a small <a target="_blank" href="https://forms.gle/rKfSgF1zJ5NWhCMb6" style="color: hsl(120deg 100% 31%); font-weight: bold;">survey</a>. Please let us know about your experience with the Open Earth Engine Library and extension. '
        message.style.background='linear-gradient(to top right, hsl(244deg 59% 55% / 50%) 10%, hsl(274deg 91% 79% / 50%))';
        message.style.borderRadius= '5px';
        message.style.paddingLeft= '5px';
    }
});