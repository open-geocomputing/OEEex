export function initialize(){
    chrome.action.onClicked.addListener(tab => {
		if(tab.url.startsWith('https://code.earthengine.google.com') || tab.url.startsWith('https://code.earthengine.google.co.in')){
			chrome.tabs.create({ url: "https://www.open-geocomputing.org/OpenEarthEngineLibrary/" });
		}
		else{
			chrome.tabs.create({ url: "https://code.earthengine.google.com/" });
		}
	});
}