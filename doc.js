function updateToNewUrl(url){
	let hash='#homePage'
	var index = url.indexOf("#");
	if (index !== -1)
	{
		hash = url.substring(index);
	}
	document.querySelectorAll('.box').forEach((e)=>e.classList.add('hide'))
	document.querySelector(hash).classList.remove('hide')
}

window.addEventListener('hashchange',(e)=>{updateToNewUrl(e.newURL)})

updateToNewUrl(window.location.toString())