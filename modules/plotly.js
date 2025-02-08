const consolePlotlyExtensionPrefix='OEEex_AddonPlotly';
let plotPosition=0;
let EECache={};

let listPlot=[];

const listPlotlyEvent=[
	"plotly_click",
	"plotly_hover",
	"plotly_unhover",
	"plotly_selecting",
	"plotly_selected",
	"plotly_legendclick",
	"plotly_legenddoubleclick",
	"plotly_restyle",
	"plotly_relayout",
	"plotly_deselect",
	"plotly_doubleclick",
	"plotly_redraw",
	"plotly_animated"
];

let plotlyDarkTemplate={};


let OEEexEscapeURL = trustedTypes.createPolicy("OEEexEscapeURL", {
	createScriptURL: (string, sink) => string
});

let OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
	createHTML: (string, sink) => string
});

function isPromise(p) {
	if (typeof p === 'object' && typeof p.then === 'function') {
		return true;
	}

	return false;
}

function hashCode(str) {
	let hash = 0;
	for (let i = 0, len = str.length; i < len; i++) {
		let chr = str.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

function htmlDecode(input) {
	var doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent;
}

function injectPlotly(extensionId){
	var s = document.createElement('script');
	s.src = OEEexEscapeURL.createScriptURL("chrome-extension://"+extensionId+"/3rd_party/plotly-2.26.0.min.js");
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
}



function loadConsolePlotlyWatcher(){
	let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
	let myObserver          = new MutationObserver(function(mutList){

		[...mutList].map(function(mut){
			[...mut.addedNodes].map(function(e){
				if(e.classList.contains('OEEexPlotlyAnalysis'))
					return;
				e.classList.add('OEEexPlotlyAnalysis')
				analysisPlotlyAddon(e)
			});
		});
	});
	let obsConfig = { childList: true};
	
	if(document.querySelector('ee-console'))
		myObserver.observe(document.querySelector('ee-console'), obsConfig);

	let myObserver2= new MutationObserver(function(mutList){

		let cleaned=[...mutList].map(e=> [...e.addedNodes]).flat().filter(f=> (f.classList &&
			f.classList.contains('ui-label') &&
			! f.classList.contains('OEEexPlotlyAnalysis') &&
			f.textContent &&
			f.textContent.startsWith(consolePlotlyExtensionPrefix+':')&&
			document.body.contains(f))
		||
		(f.classList &&
			f.classList.contains('ui-textbox') &&
			! f.classList.contains('OEEexPlotlyAnalysis') &&
			f.querySelector('input').placeholder=="OEEex_Active_AddonPlotly" &&
			document.body.contains(f)))

		cleaned=cleaned.filter(function(value, index, self) {
			return self.indexOf(value) === index;
		});

		cleaned.map(function(e){
			e.style.padding=0;
			if(e.classList.contains('ui-textbox'))
			{
				e.classList.add('OEEexPlotlyAnalysis')
				let input=e.querySelector('input');
				input.style.display='none';
				let plotDiv=document.createElement('div');
				plotDiv.style.margin=0;
				e.appendChild(plotDiv);
				if(input.placeholder=="OEEex_Active_AddonPlotly"){
					addPlotlyPlot(input.value,plotDiv,true,input);
				}
			}
			else{
				e.classList.add('OEEexPlotlyAnalysis')
				addPlotlyPlot(e.textContent.slice((consolePlotlyExtensionPrefix+':').length),e,true);
			}
		});

	});
	let obsConfig2 = { childList: true, subtree:true};
	if(document.querySelector('.ui-root'))
		myObserver2.observe(document.querySelector('.ui-root'), obsConfig2);


	let resizeObserver= new ResizeObserver(function(newSize,element){
		document.querySelectorAll('.js-plotly-plot:not(.inApp)').forEach(function(e){
			Plotly.relayout(e,{width: newSize[0].contentRect.width-5})
		})
	});
	
	if(document.querySelectorAll('.goog-splitpane-second-container').length>1)
		resizeObserver.observe(document.querySelectorAll('.goog-splitpane-second-container')[1]);

	if(document.querySelector('.goog-button.run-button'))
		document.querySelector('.goog-button.run-button').addEventListener('click',function(){plotPosition=0;})
	if(document.querySelector('.goog-button.reset-button'))
		document.querySelector('.goog-button.reset-button').addEventListener('click',function(){plotPosition=0;})
}

function analysisPlotlyAddon(val){
	val.querySelectorAll('.trivial').forEach(function(obj){
		let consoleCode=obj.innerHTML;
		if(consoleCode.startsWith(consolePlotlyExtensionPrefix+':')){
			addPlotlyPlot(consoleCode.slice((consolePlotlyExtensionPrefix+':').length),obj,false);
			return; 
		}
	});

	val.querySelectorAll('.ui-widget.ui-textbox').forEach(function(obj){
		let input=obj.querySelector('input');
		let plotDiv=document.createElement('div');
		obj.appendChild(plotDiv);
		if(input.placeholder=="OEEex_Active_AddonPlotly"){
			input.style.display='none';
			addPlotlyPlot(input.value,plotDiv,false,input);
		}
	});
	
}

function explorAllJSON(input){
	let promisesArray=[];
	
	if(input && !(typeof input === 'string' || input instanceof String)){
		let keys=Object.keys(input);
		for (let idx=0; idx< keys.length; idx++) {
			let key=keys[idx];
			if(input[key] && input[key].toString && input[key].toString().slice(0,3)=="ee."){
				let keyCache=hashCode(ee.Serializer.toJSON(input[key]))
				if(keyCache in EECache){
					if(isPromise(EECache[keyCache])){
						EECache[keyCache].then(function(eeCompute){
							input[key]=eeCompute;
						})
					}else{
						input[key]=EECache[keyCache];
					}
				}else{

					let prom=new Promise((resolve, reject) => {
						input[key].evaluate(function(eeCompute){
							resolve(eeCompute);
							input[key]=eeCompute;
							EECache[keyCache]=eeCompute
						})
					})
					promisesArray.push(prom)
				}
				continue;
			}

			let out=explorAllJSON(input[key]);
			input[key]=out.ud;
			promisesArray=promisesArray.concat(out.promises);
		}
	}
	return {ud:input,promises:promisesArray}
}

function updatePlot(plotDiv,plot){
	plotDiv.classList.add('loading');
	var plotEval=explorAllJSON(plot)
	Promise.all(plotEval.promises).then(function(){
		let plot=configPlot(plotEval.ud,plotDiv,plotDiv.classList.contains('inApp'));
		Plotly.react(plotDiv,plot.data,plot.layout);
		plotDiv.classList.remove('loading');
		plotDiv.addEventListener('refreshDraw', switch2DarkMode.bind(null, plot), false);
	})
}



function configPlot(plot,val,inApp){


	if(!plot.layout){
		plot.layout={}
	}
	if(!plot.layout.width){
		if(!inApp && document.querySelectorAll('.goog-splitpane-second-container').length>1)
			plot.layout.width=getComputedStyle(document.querySelectorAll('.goog-splitpane-second-container')[1]).width.slice(0,-2)-12;
		if(inApp && val.style.width){
			plot.layout.width=val.style.width.slice(0,-2);
		}
	}
	if(!plot.layout.height){
		if(!inApp && document.querySelectorAll('.goog-splitpane-second-container').length>1)
			plot.layout.height=Math.max(Math.min(getComputedStyle(document.querySelectorAll('.goog-splitpane-second-container')[1]).height.slice(0,-2)-12,500),250);
		if(inApp && val.style.height)
		{ 
			plot.layout.height=val.style.height.slice(0,-2);
		}
	}
	if(!plot.layout.margin){
		plot.layout.margin={
			l: 50,
			r: 50,
			b: 50,
			t: 50,
			pad: 4
		}
	}

	if(plot.transparent)
	{
		plot.layout.paper_bgcolor="#0000";
		plot.layout.plot_bgcolor="#0000";
	}

	if(plot.annotations){
		if(!plot.layout)plot.layout={};
		plot.layout.annotations=plot.annotations;
	}

	if(document.getElementsByTagName('html')[0].classList.contains('dark')){
		plot.layout.template=plotlyDarkTemplate;
	}

	return plot
}

function switch2DarkMode(plot,e) {
	console.log(event,e,plot)
	if(e.detail.darkMode){
	 	plot.layout.template=plotlyDarkTemplate;
	}else{
	 	delete plot.layout.template;
	}
	Plotly.relayout(e.currentTarget,plot.layout)
}

function addPlotlyPlot(consoleCode,val,inApp,input){
	val.classList.add('loading');
	val.classList.add('explorer');
	val.innerHTML=OEEexEscape.createHTML('Plotly: Computing');
	let plot=ee.Deserializer.fromJSON(consoleCode)
	let locPlotPosition=plotPosition++;
	var plotEval=explorAllJSON(plot)
	Promise.all(plotEval.promises).then(function(){
		plot=configPlot(plotEval.ud,val, inApp);

		//for config
		let imageExportFormat='png';// one of png, svg, jpeg, webp
		let imageExportName="EE_plotly_chart";
		if(document.querySelectorAll('.goog-splitpane-second-container .panel.editor-panel .header > span').length>0)
			imageExportName="EE_plotly_chart_"+document.querySelectorAll('.goog-splitpane-second-container .panel.editor-panel .header > span')[0].textContent.replace('/', '_')+'_'+locPlotPosition;
		let imageExportScale=4;
		if(plot.exportFormat){
			imageExportFormat=plot.exportFormat;
		}
		if(plot.exportName){
			imageExportName=plot.exportName;
		}
		if(plot.exportScale){
			imageExportScale=plot.exportScale;
		}

		let config={
			displaylogo: false,
			toImageButtonOptions: {
				format: imageExportFormat, 
				filename: imageExportName,
				scale: imageExportScale // Multiply title/legend/axis/canvas sizes by this factor
			}
		}


		val.innerHTML=OEEexEscape.createHTML('');

		Plotly.newPlot( val, plot.data, plot.layout,config )

		if(inApp)
		{
			val.classList.add('inApp')
		}

		if(input){
			const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
			Object.defineProperty(input, "value", {
				get: desc.get,
				set: function(v) {
					try{
						let payload=ee.Deserializer.fromJSON(v)
						if(payload.toEE===false){
							updatePlot(val,payload)
						}
					}catch(e){

					}
					desc.set.call(this, v);
				}
			});

			function allEvent(type, input, data){
				let payload={toEE:true, type:type, plotlyData:data,time:Date.now()}
				try{
					input.value=JSON.stringify(payload,function(key,val){return (key.startsWith('_')|| ['targetLinks','sourceLinks','links','data','fullData'].includes(key) ?undefined:val)})
					input.dispatchEvent(new Event('change'))
				}catch(e){
					console.error(e)
				}
			}

			for (var i = listPlotlyEvent.length - 1; i >= 0; i--) {
				let eventType=listPlotlyEvent[i];
				val.on(eventType, function(data){allEvent(eventType,input,data)});
			}

		}

		val.addEventListener('refreshDraw', switch2DarkMode.bind(null, plot), false);

		val.classList.remove('loading');
		//[...document.querySelectorAll('.gm-style')].forEach(e=> e.dispatchEvent(new Event('resize')))
		listPlot.push(val)
	})
}

function loadDarkModeManager(){

	document.addEventListener("darkModeEvent",function(event){
		listPlot=listPlot.filter((e)=>document.body.contains(e))
		listPlot.forEach(function(elem){
			elem.dispatchEvent(new CustomEvent('refreshDraw',{detail:{darkMode:event.detail.toDark}}));
		})
	})	
}


async function loadJSON(extensionId) {
	const response = await fetch("chrome-extension://"+extensionId+"/otherAssets/darkPlotly.json");
	const data = await response.json();
	return data;
}

export function initializeMT(extensionId){
	loadJSON(extensionId).then(data => plotlyDarkTemplate=data);
	injectPlotly(extensionId);
	loadConsolePlotlyWatcher();
	loadDarkModeManager();

}