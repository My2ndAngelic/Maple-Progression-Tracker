// About page initialization
if (document.getElementById('aboutView')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
    });
}