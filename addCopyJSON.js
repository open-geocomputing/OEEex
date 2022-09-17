function loadConsoleJSONWatcher(){
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){
		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if(e.classList.contains('OEEexJSONAnalysis'))
					return;
				e.classList.add('OEEexJSONAnalysis')
				let myObserverLocal = new MutationObserver(function(val){
					val=[...val.map(e => Array.from(e.addedNodes))].flat();
					let button=val.filter(o=>o.classList.contains('json-switch'))[0];
					let pre=val.filter(o=>o.tagName=='PRE')[0];

					if (pre && button) {
						button.addEventListener('dblclick',function(el){
							navigator.clipboard.writeText(pre.innerText);
						})
					}
					myObserverLocal.disconnect();
				});
				let obsConfig = { childList: true};
				let obj=e.querySelector('.explorer.loading');
				if(obj)
					myObserverLocal.observe(obj, obsConfig);
			});
		});
	});
	let obsConfig = { childList: true};
	
	if(document.querySelector('ee-console'))
		myObserver.observe(document.querySelector('ee-console'), obsConfig);
}

loadConsoleJSONWatcher();
