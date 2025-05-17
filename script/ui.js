// Common UI elements and functionality
export const navbar = `  <div id="navbar">    
    <button id="overviewBtn" onclick="window.location.href='overview.html'">Overview</button>
    <button id="helpBtn" onclick="window.location.href='help.html'">Help</button>    <button id="progressionBtn" onclick="window.location.href='progression.html'">Progression</button>
    <div class="dropdown">
      <button id="equipmentBtn">Equipment ▼</button>
      <div class="dropdown-content">
        <a href="equipment.html">Armor</a>
        <a href="accessory.html">Accessory</a>
        <a href="cash.html">Cash Shop</a>
      </div>
    </div>
    <div class="dropdown">
      <button id="symbolsBtn">Symbols ▼</button>
      <div class="dropdown-content">
        <a href="arcane.html">Arcane</a>
        <a href="sacred.html">Sacred</a>
      </div>
    </div>
    <button id="darkModeToggle">🌙 Dark Mode</button>
  </div>
  <h1>MapleStory Tracker</h1>
`;

export function initializeUI() {
    // Insert navbar at the start of the container
    const container = document.getElementById('container') || document.body;
    container.insertAdjacentHTML('afterbegin', navbar);
    initializeTheme();
}

function initializeTheme() {
    const darkToggleBtn = document.getElementById('darkModeToggle');
    const themeLink = document.getElementById('themeStylesheet');
    
    if (!darkToggleBtn || !themeLink) return;    // Ensure initial theme is set even if no preference exists
    const isDark = localStorage.getItem('darkMode') === 'true';
    const basePath = window.location.pathname.includes('/html/') ? '../' : '';
    themeLink.href = `${basePath}style/${isDark ? 'style-dark.css' : 'style.css'}`;
    darkToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';

    // Set up theme toggle
    darkToggleBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('darkMode') === 'true';
        applyTheme(!currentTheme);
    });
}

function applyTheme(isDark) {
    const themeLink = document.getElementById('themeStylesheet');
    const darkToggleBtn = document.getElementById('darkModeToggle');
      // Set theme
    const basePath = window.location.pathname.includes('/html/') ? '../' : '';
    themeLink.href = `${basePath}style/${isDark ? 'style-dark.css' : 'style.css'}`;
    darkToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('darkMode', isDark);
}