function addOEEMenu(){

    let button=document.createElement('ee-menu-button');
    button.innerHTML='<img slot="button" style="max-height: 25px; margin-right:-5px;" src="'+chrome.runtime.getURL("/images/logo_white_OEEex_open_128.png")+'">';
    button.setAttribute('align',"right");
    
    let userBoxElement=document.getElementsByTagName('user-box')
    if(userBoxElement && userBoxElement.length>0)
    {
        var localRoot=userBoxElement[0].shadowRoot;
        localRoot.children[0].insertBefore(button,localRoot.children[0].firstChild)
    }

    addContextMneu(button);
}

let contextOEEMenuRegistationMenuItem=null;

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
        contextMenu.innerHTML = ''; // Clear existing items
        menuItems.forEach(item => {
            const button = document.createElement('button');
            button.classList.add('oeeMenuContextButton');
            button.textContent = item.label;
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

function addOEEMenuListner(){
    window.addEventListener('add2OEEMenu', (event) => {
        const { name, callback } = event.detail;
        contextOEEMenuRegistationMenuItem(name, callback)
    });
}

export function initialize(){
    addOEEMenu();
    addOEEMenuListner()
    const customEvent = new CustomEvent('add2OEEMenu', {
        detail: {
            name: 'Options',
            callback: () => window.open(chrome.runtime.getURL('/option/options.html'), '_blank')
        }
    });
    window.dispatchEvent(customEvent);
}