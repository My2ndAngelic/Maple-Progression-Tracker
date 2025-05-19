// Common UI elements and functionality
export const navbar = `
  <div id="navbar">    
    <button id="overviewBtn" onclick="window.location.href='overview.html'">Overview</button>
    <button id="progressionBtn" onclick="window.location.href='progression.html'">Progression</button>
    <div class="dropdown">
      <button id="equipmentBtn">Equipment ▼</button>
      <div class="dropdown-content">
        <a href="armor.html">Armor</a>
        <a href="accessory.html">Accessory</a>
        <a href="cash.html">Cash</a>
      </div>
    </div>
    <div class="dropdown">
      <button id="symbolsBtn">Symbols ▼</button>
      <div class="dropdown-content">
        <a href="arcane.html">Arcane</a>
        <a href="sacred.html">Sacred</a>
      </div>
    </div>
    <button id="innerabilityBtn" onclick="window.location.href='innerability.html'">Inner Ability</button>
    <button id="helpBtn" onclick="window.location.href='help.html'">Help</button>
    <button id="darkModeToggle">🌙 Dark Mode</button>
  </div>
  <h1>MapleStory Tracker</h1>
`;

export function initializeUI() {
    // Insert navbar at the start of the body
    document.body.insertAdjacentHTML('afterbegin', navbar);
    
    // Set the common title - inherit from index.html
    document.title = 'MapleStory Tracker';
    
    // Initialize theme
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
    themeLink.href = `${basePath}style/${isDark ? 'dark.css' : 'style.css'}`;
    darkToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    // Add or remove dark-mode class on body element
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
}