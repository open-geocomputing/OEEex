var OEEexidString=document.currentScript.src.match("([a-z]{32})|([0-9a-f-]{36})")[0];
var lightIsAutomatic=true;
var portWithBackground=null;

if(typeof OEEexEscape == 'undefined'){
	OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
		createHTML: (string, sink) => string
	});
}

function addOEEMenu(){

	let button=document.createElement('ee-menu-button');
	button.innerHTML=OEEexEscape.createHTML('<img slot="button" style="max-height: 25px; margin-right:-5px;" src="chrome-extension://'+OEEexidString+'/images/logo_white_OEEex_open_128.png">');
	button.setAttribute('align',"right");
	
	let userBoxElement=document.getElementsByTagName('user-box')
	if(userBoxElement && userBoxElement.length>0)
	{
		var localRoot=userBoxElement[0].shadowRoot;
		localRoot.children[0].insertBefore(button,localRoot.children[0].firstChild)
	}

	addContextMneu(button);
}

contextOEEMenuRegistationMenuItem=null;

function addContextMneu(button){
	const contextMenu = document.createElement('div');
	contextMenu.classList.add('oeeMenuContextContainer');
	document.body.appendChild(contextMenu);

	const menuItems = [];
	function registerMenuItem(label, action) {
		menuItems.push({ label, action });
	}
	contextOEEMenuRegistationMenuItem=registerMenuItem;

	// Step 3: Function to populate and display the context menu
	function showContextMenu(x, y) {
		contextMenu.innerHTML = OEEexEscape.createHTML(''); // Clear existing items
		menuItems.forEach(item => {
			const button = document.createElement('button');
			button.classList.add('oeeMenuContextButton');
			button.textContent = OEEexEscape.createHTML(item.label);
			button.onclick = () => {
				item.action();
				contextMenu.style.display = 'none'; // Hide menu after action
			};
			contextMenu.appendChild(button);
		});

		contextMenu.style.left = `${x}px`;
		contextMenu.style.top = `${y}px`;
		contextMenu.style.display = 'block';
	}


	button.addEventListener('click', (e) => {
		e.stopPropagation(); // Prevent click from propagating to the document
		// Use the button's position as the anchor point for the context menu
		const rect = e.target.getBoundingClientRect();
		const x = rect.left;
		const y = rect.bottom; // Position the menu at the bottom of the button
		showContextMenu(x, y);
	});

	// Add an event listener to the entire document
	document.addEventListener('click', (event) => {
	// Check if the click was outside the contextMenu
		if (!contextMenu.contains(event.target)) {
			contextMenu.style.display = 'none';
		}
	});

	document.addEventListener('keydown', (event) => {
		if ((event.keyCode == 27)) {
			contextMenu.style.display = 'none';
		}
	});

	// Ensure the menu doesn't close when clicking inside it
	contextMenu.addEventListener('click', (event) => {
		event.stopPropagation();
	});
}

addOEEMenu();

// Example registration of a menu item
contextOEEMenuRegistationMenuItem('Options', () => window.open('chrome-extension://'+OEEexidString+'/options.html', '_blank'));