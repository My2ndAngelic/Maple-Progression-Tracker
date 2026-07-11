// Common UI elements and functionality
export const navbar = `
  <div id="navbar">    
    <button id="overviewBtn" onclick="window.location.href='overview.html'"><span class="nav-label">Overview</span></button>
    <button id="progressionBtn" onclick="window.location.href='progression.html'"><span class="nav-label">Progression</span></button>
    <div class="dropdown">
      <button id="equipmentBtn"><span class="nav-label">Equipment ▼</span></button>
      <div class="dropdown-content">
        <a href="armor.html"><span class="menu-label">Armor</span></a>
        <a href="accessory.html"><span class="menu-label">Accessory</span></a>
        <a href="cash.html"><span class="menu-label">Cash</span></a>
      </div>
    </div>
    <div class="dropdown">
      <button id="symbolsBtn"><span class="nav-label">Symbols ▼</span></button>
      <div class="dropdown-content">
        <a href="arcane.html"><span class="menu-label">Arcane</span></a>
        <a href="sacred.html"><span class="menu-label">Sacred</span></a>
        <a href="grandsacred.html"><span class="menu-label">Grand Sacred</span></a>
      </div>
    </div>
    <button id="innerabilityBtn" onclick="window.location.href='innerability.html'"><span class="nav-label">Inner Ability</span></button>
    <button id="helpBtn" onclick="window.location.href='help.html'"><span class="nav-label">Help</span></button>
    <button id="aboutBtn" onclick="window.location.href='about.html'"><span class="nav-label">About</span></button>
    <button id="darkModeToggle"><span class="nav-label">🌙 Dark Mode</span></button>
  </div>
`;

export function initializeUI() {
    // Only insert navbar if it doesn't already exist
    if (!document.getElementById('navbar')) {
        // Insert navbar at the start of the body
        document.body.insertAdjacentHTML('afterbegin', navbar);
    }

    // Get the current page name from the HTML filename
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    // Convert first letter to uppercase and replace dashes with spaces
    const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');

    // Set the page title in the browser tab
    document.title = `MapleStory Tracker - ${formattedPageName}`;

    // Update any existing H1 title, or add one if it doesn't exist
    // const container = document.getElementById('container');
    // const existingTitle = container.querySelector('h1');
    
    // if (existingTitle) {
    //     // Just ensure the title is correct
    //     existingTitle.textContent = formattedPageName;
    // }

    // Initialize theme
    initializeTheme();
}

// Export this function so it can be used separately
export function initializeTheme() {
    const darkToggleBtn = document.getElementById('darkModeToggle');
    const themeLink = document.getElementById('themeStylesheet');
    if (!darkToggleBtn || !themeLink) return;
    
    // Load saved theme preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    applyTheme(isDark);
    
    // Set up theme toggle - only if we're not on the overview page (which has its own toggle)
    if (!document.getElementById('charTable')) {
        darkToggleBtn.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('darkMode') === 'true';
            applyTheme(!currentTheme);
        });
    }
}

// Export applyTheme for use in other modules
export function applyTheme(isDark) {
    const themeLink = document.getElementById('themeStylesheet');
    const darkToggleBtn = document.getElementById('darkModeToggle');
    if (!themeLink || !darkToggleBtn) return;
    
    // Set theme
    const basePath = window.location.pathname.includes('/html/') ? '../' : '';
    themeLink.href = `${basePath}style/${isDark ? 'style-dark.css' : 'style.css'}`;
    darkToggleBtn.innerHTML = `<span class="nav-label">${isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>`;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Add or remove dark-mode class on body element
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
    
    // Force a redraw of the page to ensure all styles are updated
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
}