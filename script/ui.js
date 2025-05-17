// Common UI elements and functionality
export const navbar = `
  <div id="navbar">
    <a href="overview.html"><button id="overviewBtn">Overview</button></a>
    <a href="progression.html"><button id="progressionBtn">Progression</button></a>
    <a href="equipment.html"><button id="equipmentBtn">Equipment</button></a>
    <a href="cash.html"><button id="cashBtn">Cash</button></a>
    <a href="arcane.html"><button id="arcaneBtn">Arcane Symbol Detail</button></a>
    <a href="sacred.html"><button id="sacredBtn">Sacred Symbol Detail</button></a>
    <button id="darkModeToggle">🌙 Dark Mode</button>
  </div>
  <h1>MapleStory Tracker</h1>
`;

export function initializeUI() {
    // Insert navbar at the start of the body
    document.body.insertAdjacentHTML('afterbegin', navbar);
    // Initialize dark mode
    initializeDarkMode();
}

function applyTheme(isDark) {
    const themeLink = document.getElementById('themeStylesheet');
    const darkToggleBtn = document.getElementById('darkModeToggle');
      themeLink.setAttribute('href', isDark ? 'style/style-dark.css' : 'style/style.css');
    if (darkToggleBtn) {
        darkToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
}

export function initializeDarkMode() {
    const darkToggleBtn = document.getElementById('darkModeToggle');
    if (darkToggleBtn) {
        // Apply saved theme preference
        const isDark = localStorage.getItem('darkMode') === 'true';
        applyTheme(isDark);

        // Set up click handler
        darkToggleBtn.addEventListener('click', () => {
            const currentTheme = document.getElementById('themeStylesheet').getAttribute('href');            const isDark = currentTheme === 'style/style.css';
            applyTheme(isDark);
        });
    }
}
