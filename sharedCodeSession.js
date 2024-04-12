let showVersionSwitchModal=null;
(function() {

	let OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];

	if(typeof OEEexEscapeURL == 'undefined'){
		OEEexEscapeURL = trustedTypes.createPolicy("OEEexEscapeURL", {
			createScriptURL: (string, sink) => string
		});
	}
	if(typeof OEEexEscape == 'undefined'){
		OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
			createHTML: (string, sink) => string
		});
	}

	function injectPeer(){
		var s = document.createElement('script');
		s.src = OEEexEscapeURL.createScriptURL("chrome-extension://"+OEEexidString+"/3rd_party/peerjs.min.js");
		s.onload = function() {
			this.remove();
		};
		(document.head || document.documentElement).appendChild(s);
	}

	function injectDiff(){
		var s = document.createElement('script');
		s.src = OEEexEscapeURL.createScriptURL("chrome-extension://"+OEEexidString+"/3rd_party/diff.min.js");
		s.onload = function() {
			this.remove();
		};
		(document.head || document.documentElement).appendChild(s);
	}

	let sessionPassword=null;
	let listConnection=new Set();

	function anwserToRequest(data){
		if(data.type && data.type=="editorFullContent"){
			editor.getSession().setValue(data.content);
			lastSendVersion=data.content;
		}
		if(data.type && data.type=="editorPatch"){
			let previousLastVersion=lastSendVersion
			lastSendVersion=Diff.applyPatch(lastSendVersion, data.patch);
			let newCode=Diff.applyPatch(editor.getSession().getValue(), data.patch);
			if(newCode)
			{
				editor.getSession().setValue(newCode);
			}
			else{
				//try to fix
				let patch = Diff.createPatch("filename", previousLastVersion, editor.getSession().getValue(), "", "");
				let newCode=Diff.applyPatch(previousLastVersion, patch);
				if(newCode)
				{
					console.log("fix worked")
					editor.getSession().setValue(newCode);
					showVersionSwitchModal();
				}else{
					showVersionSwitchModal();
				}
			}
		}
		if(data.type && data.type=="selections"){
			displayRemoteSelection(data);
		}
	}

	function displayRemoteSelection(data){
		// Get all markers
		var markers = editor.session.getMarkers();

		// Iterate through the markers object
		for (var markerId in markers) {
			// Check if the marker class matches "myCustomHighlightClass"
			if (markers[markerId].clazz === "remoteSelection") {
				// Remove the marker
				editor.session.removeMarker(markerId);
			}
		}

		if(data.isEmpty)
			return

		console.log(data.ranges)
		let convertedRanges=data.ranges.map(convertRange)
		console.log(convertedRanges)

		convertedRanges.map(function(range){
			editor.getSession().addMarker(range, "remoteSelection", "text", false);
		})

		// var myRange = new Range(1, 0, 1, 10); // This highlights from row 1, column 0 to row 1, column 10

		// // Add the marker
		// // Parameters for addMarker are: range, className, type, inFront
		// var markerId = editor.session.addMarker(myRange, "myCustomHighlightClass", "text", false);
	}

	function convertRange(range){
		// Sample multi-line original and new texts
		var originalText = lastSendVersion;
		var newText =editor.getSession().getValue() ;

		// Example selection in original text: From "original" in line 3, column 5 to column 14
		var selectionStart = range.start;
		var selectionEnd = range.end;

		// Generate unique placeholders
		var startPlaceholder = "<OEE_SELECTION_START>";
		var endPlaceholder = "<OEE_SELECTION_END>";

		// Function to insert placeholders into the original text
		function insertPlaceholders(text, start, end, startPlaceholder, endPlaceholder) {
			// Convert row/column positions to linear indices
			var lines = text.split("\n");
			var startIndex = lines.slice(0, start.row).join("\n").length + start.column + 1; // +1 for newline characters
			var endIndex = lines.slice(0, end.row).join("\n").length + end.column + 1; // +1 for newline characters

			// Insert placeholders
			return text.slice(0, startIndex) + startPlaceholder + text.slice(startIndex, endIndex) + endPlaceholder + text.slice(endIndex);
		}

		// Insert placeholders into the original text
		var modifiedOriginalText = insertPlaceholders(originalText, selectionStart, selectionEnd, startPlaceholder, endPlaceholder);

		// Generate a patch and apply it
		var patch = Diff.createPatch("filename", originalText, newText, "", "");
		var patchedText = Diff.applyPatch(modifiedOriginalText, patch);

		// Find the new positions of the placeholders
		var newStartIndex = patchedText.indexOf(startPlaceholder);
		var newEndIndex = patchedText.indexOf(endPlaceholder) - startPlaceholder.length; // Adjust for the length of the start placeholder

		// Convert linear indices back to row/column positions
		function indexToPosition(text, index) {
			var lines = text.substring(0, index).split("\n");
			var row = lines.length - 1;
			var column = lines[lines.length - 1].length;
			return { row:row, column:column };
		}

		var newStartPosition = indexToPosition(patchedText, newStartIndex);
		var newEndPosition = indexToPosition(patchedText, newEndIndex);

		return new aceRange(newStartPosition.row,newStartPosition.column, newEndPosition.row,newEndPosition.column);
	}

	function getLastContent(){
		return {type:"editorFullContent", content:lastSendVersion}
	}

	function getPatch(oldVersion, newVersion){
		return {type:"editorPatch", patch:Diff.createPatch("EECode", oldVersion, newVersion)}
	}

	function onEditorChange(change){
		let newVersion=editor.getSession().getValue();
		broadcastToEveryone(getPatch(lastSendVersion,newVersion));
		lastSendVersion=newVersion;
	}

	function onSelectionChange(event,selection){
		console.log(selection.getAllRanges());
		broadcastToEveryone({type:"selections",ranges:JSON.parse(JSON.stringify(selection.getAllRanges())), isEmpty:selection.isEmpty()})
	}

	function broadcastToEveryone(content){
		[...listConnection].map(x => x.send(content));
	}


	let lastSendVersion="";

	function addToListOFConnectionAndSendLastversion(con){
		listConnection.add(con)
		con.send(getLastContent());
	} 

	let editor=null;
	let aceRange=null;
	function handleSessionAction(popupElement, sessionId, password, actionType) {
		console.log(`Session ID: ${sessionId}, Password: ${password}, Action: ${actionType}`);

		let editorElement=document.getElementsByClassName('ace_editor');
		if(editorElement && editorElement.length>0){
			editorElement[0].id='editor'
			editor = ace.edit("editor");
			aceRange = ace.require('ace/range').Range;
		}

		let oeePeerServer={
			host: "ee-peer.open-geocomputing.org",
			port: 443,
			path: "/ee-peer",
		}
		// get editor
		if("host"==actionType ){
			sessionPassword=password;
			var peer = new Peer(sessionId,oeePeerServer);
			peer.on('open', function(id) {
				console.log('My peer ID is: ' + id);
				editor.getSession().on('change', onEditorChange);
				editor.getSession().selection.on('changeSelection', onSelectionChange);
				popupElement.classList.remove("visible");
			});

			peer.on('connection', function(con){
				con.on('data', function(data){
					if(data.type && data.type=="connection"){
						if(data.status && data.status=="active"){
							if(sessionPassword!=""){
								console.log("request pasword");
								con.send({type:"passwordRequest"});
							}else{
								addToListOFConnectionAndSendLastversion(con);
								con.send({type:"connection",status:"registred"});
							}
						}
					}

					if(data.type && data.type=="password"){
						if(sessionPassword=="" || data.pwd==sessionPassword){
							addToListOFConnectionAndSendLastversion(con);
							con.send({type:"connection",status:"registred"});
						}else{
							con.send({type:"wrongPassword"});
							setTimeout(con.close,100);
						}
					}
				});
			});
		}

		if("join"==actionType ){
			sessionPassword=password;
			var peer = new Peer(oeePeerServer);
			peer.on('open', function(id) {
				console.log('My peer ID is: ' + id);
				var con = peer.connect(sessionId,{reliable:true});
				con.on('data',anwserToRequest);
				con.on('data', function(data){
					if(data.type && data.type=="passwordRequest"){
						con.send({type:"password",pwd:sessionPassword})
					}
					if(data.type && data.type=="wrongPassword"){
						popupElement.querySelector("#sessionPassword").classList.add("wrong")
					}
					if(data.type && data.type=="connection" && data.status=="registred"){
						popupElement.classList.remove("visible");
					}
					
				});
				con.on('open', function(){
					con.send({type:"connection",status:"active"});
					// request last version, not needed the server send it automatically
				});
			});

			peer.on('error', function(err) {
				popupElement.querySelector("#sessionId").classList.add("wrong")
				peer.destroy()
			});
		}
	}

	

	function createSharedCodeSessionPopup(){
		// Create the popup container
		const popup = document.createElement('div');
		popup.className = 'oeeSCSContainer'; // Reuse context menu styling
		document.body.appendChild(popup);

		// Add content to the popup
		popup.innerHTML = OEEexEscape.createHTML(`
			<div id="sessionToggle" class="session-toggle">
				<button id="joinSession" class="toggle-btn left active">Join a session</button>
				<button id="hostSession" class="toggle-btn right">Host a session</button>
			</div>
			<input type="hidden" id="sessionType" value="join" />
			<input type="text" id="sessionId" placeholder="Session ID" />
			<input type="password" id="sessionPassword" placeholder="Password (Optional)" autocomplete="off" />
			<button id="validateSession" class="toggle-btn">Connect</button> <!-- The text will change dynamically -->
		`);

		const codePatchingErrorPopup = document.createElement('div');
		codePatchingErrorPopup.className = 'oeeSCSContainer'; // Reuse context menu styling
		codePatchingErrorPopup.id="versionSwitchModal"
		document.body.appendChild(codePatchingErrorPopup);

		codePatchingErrorPopup.innerHTML = OEEexEscape.createHTML(`
		<p style="max-width: 21em; text-align: center; margin:0"><b style="font-size:1.4em"> ⚠️Unable to apply the updates!⚠️</b><br>Do you want to stay on the current version or switch to the new version?</p>
		<button id="stayButton">Stay</button>
		<button id="switchButton">Switch</button>
		`);

		showVersionSwitchModal = function() {
			const modal = document.getElementById('versionSwitchModal');
			modal.classList.add('visible');
		}

		// Function to hide the modal
		function hideVersionSwitchModal() {
			const modal = document.getElementById('versionSwitchModal');
			modal.classList.remove('visible');
		}

		// Event listeners for the buttons
		document.getElementById('stayButton').addEventListener('click', function() {
			hideVersionSwitchModal();
			console.log("User chose to stay on the current version.");
			// Additional logic to handle staying on the current version
			// what should we do ??
		});

		document.getElementById('switchButton').addEventListener('click', function() {
			hideVersionSwitchModal();
			editor.getSession().setValue(lastSendVersion)
		});


		let sessionId = document.getElementById('sessionId');
		let passwordSession = document.getElementById('sessionPassword');
		let hostSession = document.getElementById('hostSession');
		let joinSession = document.getElementById('joinSession')

		// Function to toggle the popup visibility
		function togglePopup() {
			popup.classList.toggle("visible")
		}

		// Function to update the popup based on the selection
		const sessionTypeSelector = document.getElementById('sessionType');
		const validateButton = document.getElementById('validateSession');

		// Assuming the registration of "Share Code Session" somewhere in your code
		setTimeout(function(){
			contextOEEMenuRegistationMenuItem('Share Code Session', () => togglePopup());
		},0);

		// Prevent clicks within the popup from closing it
		popup.addEventListener('mousedown', (event) => {
			event.stopPropagation();
		});

		document.addEventListener('mousedown', (event) => {
			if (!popup.contains(event.target) && popup.classList.contains("visible")) {
				togglePopup();
			}
		});

		document.addEventListener('keydown', (event) => {
			if ((event.keyCode == 27)  && !popup.contains(event.target) && popup.classList.contains("visible")) {
				togglePopup();
			}
		});

		joinSession.addEventListener('click', function() {
			this.classList.add('active');
			hostSession.classList.remove('active');
			sessionTypeSelector.value = 'join';
			validateButton.textContent = 'Connect';
		});

		hostSession.addEventListener('click', function() {
			this.classList.add('active');
			joinSession.classList.remove('active');
			sessionTypeSelector.value = 'host';
			validateButton.textContent = 'Host';
			if(sessionId.value==""){
				sessionId.value = "ee-"+Math.random().toString(36).substring(2, 8); // Generate session ID
			}
		});

		validateButton.addEventListener('click', function() {
			const sessionIdVal = sessionId.value;
			const password = passwordSession.value;
			const actionType = sessionTypeSelector.value; // 'host' or 'join'
			sessionId.classList.remove("wrong");
			passwordSession.classList.remove("wrong");
			handleSessionAction(popup, sessionIdVal, password, actionType);
		});

	}

	injectPeer();
	injectDiff();
	createSharedCodeSessionPopup();

})();