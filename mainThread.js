// mainThread.js

let permanentModule2Load=[
];


// Load all relevant settings from storage

for (let i = 0; i < permanentModule2Load.length; i++) {
	const moduleName = permanentModule2Load[i];
	import('./modules/' + moduleName + '.js')
	.then(module => {
		if (module.initializeMT) {
			module.initializeMT();
			console.log(moduleName)
		}
	})
	.catch(err => {
		console.error('Error loading ' + moduleName + ':', err);
	});
}


window.addEventListener("moduleMT2Load", function(items) {
	let extensionId=items.detail.extensionId;
	console.log("extensionId",extensionId)
	items=items.detail.modules;
	moules2Load=Object.keys(items)
	for (let i = 0; i < moules2Load.length; i++) {
		const moduleName = moules2Load[i];
		
		// Check if the module is enabled (i.e., true) before loading
		if (items[moduleName]) {
			import('./modules/' + moduleName + '.js')
			.then(module => {
				if (module.initializeMT) {
					module.initializeMT(extensionId);
					console.log(moduleName)
				}
			})
			.catch(err => {
				console.error('Error loading ' + moduleName + ':', err);
			});
		}
	}
});
