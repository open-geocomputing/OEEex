(function() {
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

	let sessionPassword=null;
	let listConnection=new Set();

	function anwserToRequest(data){

	}

	function broadcastToEveryone(content){
		[...listConnection].map(x => x.send(content));
	}

	function handleSessionAction(popupElement, sessionId, password, actionType) {
		console.log(`Session ID: ${sessionId}, Password: ${password}, Action: ${actionType}`);
		if("host"==actionType ){
			sessionPassword=password;
			var peer = new Peer(sessionId);
			peer.on('open', function(id) {
				console.log('My peer ID is: ' + id);
			});

			peer.on('connection', function(con){
				con.on('data', function(data){
					if(data.type && data.type="password"){
						listConnection.add(con);
						con.on('data',anwserToRequest)
					}
				});
				if(sessionPassword==""){
					con.send({type:"password"});
				}else{
					listConnection.add(con);
					con.on('data',anwserToRequest)
				}
			});
		}

		if("join"==actionType ){
			sessionPassword=password;
			var peer = new Peer();
			peer.on('open', function(id) {
				console.log('My peer ID is: ' + id);
				var con = peer.connect(sessionId);
				con.on('data', function(data){
					console.log(data)
					if(data.type && data.type="password"){
						con.send(sessionPassword)
					}
				});
				con.on('open', function(){
					// request last version
				});
			});
			
			//con.send('HELLO WORLD');
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
			<input type="password" id="sessionPassword" placeholder="Password (Optional)" />
			<button id="validateSession">Connect</button> <!-- The text will change dynamically -->
		`);

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
		popup.addEventListener('click', (event) => {
			event.stopPropagation();
		});

		document.addEventListener('click', (event) => {
			if (!popup.contains(event.target) && popup.classList.contains("visible")) {
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

			handleSessionAction(popup, sessionIdVal, password, actionType);
		});

	}
	injectPeer();
	createSharedCodeSessionPopup();

})();