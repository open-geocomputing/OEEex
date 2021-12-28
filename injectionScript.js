listOfScript=['planetLab','uploadWithManifest','hackEEConfirm','EEDarkMode','addCommandS'];

chrome.storage.local.get(listOfScript, function(result){
  for(let key in result)
    if(result[key]){
    	var s = document.createElement('script');
		s.src = chrome.runtime.getURL(key+'.js');
		s.onload = function() {
		    this.remove();
		};
		(document.head || document.documentElement).appendChild(s);
    }
});

