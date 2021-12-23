/**** add command+S to save under mac ****/  
document.addEventListener('keydown',function(event) {
    if((event.metaKey) && event.which == 83) {
        document.querySelector('button.save-button').click();
        event.preventDefault();
        return false;
    }
});