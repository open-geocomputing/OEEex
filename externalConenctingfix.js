oeel_mainListner={}

window.addEventListener("message", (event) => {
	if (event.source == window &&
		event.data &&
		event.data.direction == "e2p") {
		if(oeel_mainListner[event.data.connectInfo.name])
		{
			oeel_mainListner[event.data.connectInfo.name].map((f)=>{f(event.data.message)});
		}
	}
})

function chrome_runtime_connect(extensionId,connectInfo){
	let result={
		extensionId:extensionId,
		connectInfo:connectInfo,
		onMessage:{addListener:function(fun){
			if(oeel_mainListner[connectInfo.name]==undefined){
				oeel_mainListner[connectInfo.name]=[];
			}
			oeel_mainListner[connectInfo.name].push(fun);
		}},
		onDisconnect:{addListener:function(){}},
		postMessage:function(msg){
			window.postMessage({message:msg,extensionId:extensionId,connectInfo:connectInfo,direction:"p2e"})
		}
	}
	return result;
}

chrome={runtime:{connect:chrome_runtime_connect}};