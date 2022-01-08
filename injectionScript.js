listOfScript=['isShareable','insertInCE','planetLab','uploadWithManifest','hackEEConfirm','EEDarkMode','addCommandS'];

chrome.storage.local.get(listOfScript, function(result){
	for (var i = listOfScript.length - 1; i >= 0; i--) {
		let key=listOfScript[i]
		if(result[key]){
			var s = document.createElement('script');
			s.src = chrome.runtime.getURL(key+'.js');
			s.onload = function() {
				this.remove();
			};
			(document.head || document.documentElement).appendChild(s);
		}
	}
});

