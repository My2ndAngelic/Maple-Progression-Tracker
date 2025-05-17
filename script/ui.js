// Common UI elements and functionality
export const navbar = `
  <div id="navbar">    
    <button id="overviewBtn" onclick="window.location.href='overview.html'">Overview</button>
    <button id="helpBtn" onclick="window.location.href='help.html'">Help</button>
    <button id="progressionBtn" onclick="window.location.href='progression.html'">Progression</button>
    <button id="equipmentBtn" onclick="window.location.href='equipment.html'">Equipment</button>
    <button id="cashBtn" onclick="window.location.href='cash.html'">Cash</button>
    <button id="arcaneBtn" onclick="window.location.href='arcane.html'">Arcane</button>
    <button id="sacredBtn" onclick="window.location.href='sacred.html'">Sacred</button>
    <button id="accessoryBtn" onclick="window.location.href='accessory.html'">Accessory</button>
    <button id="darkModeToggle">🌙 Dark Mode</button>
  </div>
  <h1>MapleStory Tracker</h1>
`;

export function initializeUI() {
    // Insert navbar at the start of the body
    document.body.insertAdjacentHTML('afterbegin', navbar);
    initializeTheme();
}

function initializeTheme() {
    const darkToggleBtn = document.getElementById('darkModeToggle');
    const themeLink = document.getElementById('themeStylesheet');
    if (!darkToggleBtn || !themeLink) return;
    // Load saved theme preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    applyTheme(isDark);
    // Set up theme toggle
    darkToggleBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('darkMode') === 'true';
        applyTheme(!currentTheme);
    });
}

function applyTheme(isDark) {
    const themeLink = document.getElementById('themeStylesheet');
    const darkToggleBtn = document.getElementById('darkModeToggle');
    if (!themeLink || !darkToggleBtn) return;
    // Set theme
    const basePath = window.location.pathname.includes('/html/') ? '../' : '';
    themeLink.href = `${basePath}style/${isDark ? 'style-dark.css' : 'style.css'}`;
    darkToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('darkMode', isDark);
}