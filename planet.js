var lightIsAutomatic=true;

var portWithBackground=null;
function setPortWithBackground(){
	portWithBackground= chrome.runtime.connect({name: "oeel.extension.lightMode"});
	portWithBackground.onDisconnect.addListener(function(port){ 
		portWithBackground=null;
		setPortWithBackground();
	})

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
}

setPortWithBackground();

function switch2DarkMode(toDark,isAuto=false){
	lightIsAutomatic=isAuto;
	if (toDark){
		document.getElementsByTagName('html')[0].classList.add('dark');
	}
	else{
		document.getElementsByTagName('html')[0].classList.remove('dark');
	}
};

window.addEventListener("load", function(){
	portWithBackground.postMessage({type:"getLightMode"});
});


window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
	if(lightIsAutomatic)
		switch2DarkMode(e.matches,true);
});


function displayResult(data){

	var template = document.querySelector("#planetOrder");
	var block = document.querySelector("#orderBlock");

	if(!('orders' in data) || data.orders.length==0){
		block.textContent="No order available"
		return;
	} 
	
	needToChange=false;
	nextOrders=data._links.next;
	data=data.orders;

	// data.sort(function(a, b) {
	//   return new Date.parse(a.created_on) - new Date.parse(b.created_on);
	// })

	for (let i = 0; i < data.length; i++) {
		let localData=data[i];
		var clone = document.importNode(template.content, true);
		clone.querySelector('.orderName').textContent='( '+(localData.products[0].item_ids.length)+' ) - '+localData.id;
		clone.querySelector('.createOn').textContent=( new Date(Date.parse(localData.created_on))).toString();
		clone.querySelector('.lastModif').textContent=( new Date(Date.parse(localData.last_modified))).toString();
		clone.querySelector('.state').textContent=localData.state;
		clone.querySelector('.item_type').textContent=localData.products[0].item_type;
		clone.querySelector('.product_bundle').textContent=localData.products[0].product_bundle;
		

		let mainElement=clone.querySelector('article');
		let expandButton=clone.querySelector('.expandButton');
		expandButton.addEventListener('click',function(e){
			if(mainElement.classList.contains('expended'))
			{
				mainElement.classList.remove('expended');
			}else{
				mainElement.classList.add('expended');
			}
		});

		let stateClass="";
		switch(localData.state){
			case "queued":
				stateClass="is-info";
				needToChange=true;
				break;
			case "running":
				stateClass="is-primary";
				needToChange=true;
				break;
			case "success":
				stateClass="is-success";
				break;
			case "partial":
				stateClass="is-warning";
				break;
			case "failed":
				stateClass="is-danger";
				break;
			case "cancelled":
				stateClass="is-dark";
				break;
		}
		clone.querySelector('.message').classList.add(stateClass)

		let table=clone.querySelector('.table');

		let products=localData.products[0].item_ids;
		for (let j = 0; j < products.length; j++) {
			let tr=document.createElement("tr");

			let td=document.createElement("td");
			td.textContent=products[j]
			tr.appendChild(td);

			let im=document.createElement("img");
			im.classList.add('PlanetThumbnail')
			im.setAttribute('loading','lazy');
			im.src="https://tiles.planet.com/data/v1/item-types/"+localData.products[0].item_type+"/items/"+products[j]+"/thumb";
			td=document.createElement("td");
			td.appendChild(im);
			tr.appendChild(td);

			table.appendChild(tr);
		}
		block.appendChild(clone);
	}

	if(nextOrders && needToChange){
		let PlanetOrders=new XMLHttpRequest();
		PlanetOrders.open("GET",nextOrders,true);
		PlanetOrders.responseType = 'json';
		PlanetOrders.onload = function(e) {
		 displayResult(this.response)
		}
		
		PlanetOrders.send();
	}

}

(function(){
	let PlanetOrders=new XMLHttpRequest();
	PlanetOrders.open("GET",'https://api.planet.com/compute/ops/orders/v2',true);
	PlanetOrders.responseType = 'json';
	PlanetOrders.onload = function(e) {
	 displayResult(this.response)
	}
	
	PlanetOrders.send();
})()

