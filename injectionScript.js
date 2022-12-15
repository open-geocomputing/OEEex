listOfScript=['isShareable',
	'insertInCE',
	'planetLab',
	'uploadWithManifest',
	'hackEE',
	'EEDarkMode',
	'addCommandS',
	'runAllTasks',
	'addPlotly',
	'3rd_party/shpwrite',
	'addCopyJSON',
	'editorSettings',
	'surveyMessage',
	'openScriptNewTab'
];
chrome.storage.local.get(listOfScript,
function(result){
	result['3rd_party/shpwrite']=result['uploadWithManifest'];
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

