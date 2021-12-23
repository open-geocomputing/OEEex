listOfScript=['uploadWithManifest.js','hackEEConfirm.js','EEDarkMode.js','addCommandS.js'];
for (var i = listOfScript.length - 1; i >= 0; i--)
{
	var s = document.createElement('script');
	s.src = chrome.runtime.getURL(listOfScript[i]);
	s.onload = function() {
	    this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
}

