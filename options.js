listOfScript=['uploadWithManifest','hackEEConfirm','EEDarkMode','addCommandS'];

var portWithBackground = chrome.runtime.connect({name: "oeel.extension.lightMode"});
var lightIsAutomatic=true;

function runOnceLoaded(){
  const logoPlayer = document.querySelector("#logo");
  logoPlayer.setDirection(-1);
  logoPlayer.play();

  for (var i = listOfScript.length - 1; i >= 0; i--) {
    document.querySelector('.'+listOfScript[i]).classList.add('available');
  }
}

function updateStatus(){
  chrome.storage.local.get(listOfScript, function(result){
      for(let key in result)
        setSatus(key,result[key])
    });
}

function setModuleStatus(){  
  document.querySelectorAll('.lock').forEach((e)=>
    e.addEventListener('click',function(){
      let superParentNode=e.parentNode.parentNode.parentNode;
      let className=[...superParentNode.classList].filter(value => listOfScript.includes(value));
      let newKey={};
      newKey[className]=superParentNode.classList.contains('off');
      chrome.storage.local.set(newKey);
      updateStatus();
    }
  ));
}

chrome.storage.onChanged.addListener(setSatus)

function setSatus(key,value){
  if(!(listOfScript.includes(key)))
    return;
  let element=document.querySelector('.'+key);
  let player=element.querySelector('.lock lottie-player');
  if(value){
    element.classList.remove('off');
    player.setDirection(1);
    player.play();
  }else{
    element.classList.add('off');
    player.setDirection(-1);
    player.play();
  }
}

portWithBackground.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type=='changeLightMode'){
        if(request.message=='automatic'){
          if((typeof buttonLight!= 'undefined') && buttonLight)
            buttonLight.innerHTML='brightness_medium';
      switch2DarkMode((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches),true)
    }else{
      switch2DarkMode(request.message,false);
    }
  };
})

function setLight(){
  var lightModeElement=document.querySelector('.lightMode');
  lightModeElement.querySelector('span.isAutomatic').addEventListener('click',function(){
    sendNewlightMode('automatic');
  });
  lightModeElement.querySelector('span.isDark').addEventListener('click',function(){
    sendNewlightMode(true);
  });
  lightModeElement.querySelector('span.isLight').addEventListener('click',function(){
    sendNewlightMode(false);
  });
}

function switch2DarkMode(toDark,isAuto=false){
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

window.addEventListener("load", function(){
      portWithBackground.postMessage({type:"getLightMode"});
  });

function sendNewlightMode(mode){
  portWithBackground.postMessage({type:"setLightMode", message:mode});
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if(lightIsAutomatic)
      switch2DarkMode(e.matches,true);
});


//init
runOnceLoaded();
setLight();
setModuleStatus();
