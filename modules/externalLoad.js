//this is a special module that load external script

function loadFont(){
	let fontLink = document.createElement('link');
	fontLink.type = 'text/css';
	fontLink.rel = 'stylesheet';
	(document.head || document.documentElement).appendChild(fontLink);
	fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons"
}


export function initialize(){
	loadFont()
}