import { prepareTable } from './tableUtils.js';
import { initializeUI } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the UI (adds navbar)
  initializeUI();
  
  try {
    // Load account data first to get IGN and level
    const accountResponse = await fetch('../data/account.csv');
    const accountData = await accountResponse.text();
    const accountMap = parseAccountData(accountData);
    
    // Load inner ability data
    const iaResponse = await fetch('../data/innerability.csv');
    const iaData = await iaResponse.text();
    
    // Display the data in the table
    displayInnerAbilityData(iaData, accountMap);
  } catch (error) {
    console.error('Error loading inner ability data:', error);
  }
});

/**
 * Parse the account data CSV to map IGNs to job names and levels
 * @param {string} csvData - The CSV data as a string
 * @returns {Map} - A map of IGNs to objects with job name and level
 */
function parseAccountData(csvData) {
  const accountMap = new Map();
  const lines = csvData.split('\n').filter(line => line && !line.startsWith('//'));
  
  // Skip the header line
  const headerLine = lines[0];
  const hasHeader = headerLine.toLowerCase().includes('ign');
  const startIndex = hasHeader ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = line.split(',');
    if (fields.length < 3) continue;
    
    const jobName = fields[0].trim();
    const ign = fields[1].trim();
    const level = fields[2].trim();
    
    accountMap.set(ign, { jobName, level });
  }
  
  return accountMap;
}

/**
 * Display the inner ability data in the table
 * @param {string} csvData - The CSV data as a string
 * @param {Map} accountMap - A map of IGNs to job name and level objects
 */
function displayInnerAbilityData(csvData, accountMap) {
  const tbody = prepareTable('innerAbilityTable');
  if (!tbody) return;
  
  const lines = csvData.split('\n').filter(line => line && !line.startsWith('//'));
  
  // Skip the header line
  const headerLine = lines[0];
  const hasHeader = headerLine.toLowerCase().includes('ign');
  const startIndex = hasHeader ? 1 : 0;
  
  // Sort data by IGN or Level if available
  const characterData = [];
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = line.split(',');
    if (fields.length < 10) continue; // Need at least IGN + 9 IA fields
    
    const ign = fields[0].trim();
    const accountInfo = accountMap.get(ign) || { level: 'N/A' };
    
    characterData.push({
      ign,
      level: accountInfo.level,
      p1ia1: fields[1] || '',
      p1ia2: fields[2] || '',
      p1ia3: fields[3] || '',
      p2ia1: fields[4] || '',
      p2ia2: fields[5] || '',
      p2ia3: fields[6] || '',
      p3ia1: fields[7] || '',
      p3ia2: fields[8] || '',
      p3ia3: fields[9] || ''
    });
  }
  
  // Sort by level in descending order
  characterData.sort((a, b) => {
    const levelA = parseInt(a.level) || 0;
    const levelB = parseInt(b.level) || 0;
    return levelB - levelA;
  });
  
  // Add rows to the table
  characterData.forEach(character => {
    const row = document.createElement('tr');
    
    // IGN cell
    const ignCell = document.createElement('td');
    ignCell.textContent = character.ign;
    row.appendChild(ignCell);
    
    // Level cell
    const levelCell = document.createElement('td');
    levelCell.textContent = character.level;
    row.appendChild(levelCell);
    
    // Inner Ability cells
    addIACell(row, character.p1ia1, 0); // P1 Line 1
    addIACell(row, character.p1ia2, 1); // P1 Line 2
    addIACell(row, character.p1ia3, 2); // P1 Line 3
    addIACell(row, character.p2ia1, 3); // P2 Line 1
    addIACell(row, character.p2ia2, 4); // P2 Line 2
    addIACell(row, character.p2ia3, 5); // P2 Line 3
    addIACell(row, character.p3ia1, 6); // P3 Line 1
    addIACell(row, character.p3ia2, 7); // P3 Line 2
    addIACell(row, character.p3ia3, 8); // P3 Line 3
    
    tbody.appendChild(row);
  });
}

/**
 * Add an inner ability cell to a row with appropriate styling
 * @param {HTMLElement} row - The table row element
 * @param {string} value - The inner ability value
 */
function addIACell(row, value, columnIndex) {
  const cell = document.createElement('td');
  cell.textContent = value;
  
  // Only apply coloring to Line 1 cells (columnIndex 0, 3, 6 are the Line 1 cells for each preset)
  if (value && (columnIndex === 0 || columnIndex === 3 || columnIndex === 6)) {
    if (value.includes('AS+')) {
      cell.classList.add('attack-speed');
    } else if (value.includes('Boss+')) {
      cell.classList.add('boss-damage');
    } else if (value.includes('Buff+')) {
      cell.classList.add('buff-duration');
    } else if (value.includes('CDSkip+')) {
      cell.classList.add('cooldown-skip');
    } else if (value.includes('Meso+')) {
      cell.classList.add('meso-obtain');
    } else if (value.includes('Item+')) {
      cell.classList.add('item-drop');
    } else if (value.includes('BD+')) {
      cell.classList.add('boss-damage');
    } else if (value.includes('Passive+')) {
      cell.classList.add('passive-skill');
    } else if (value.includes('Abnormal+')) {
      cell.classList.add('abnormal-status');
    }
  }
  
  if (!value) {
    // Add a non-breaking space to empty cells to maintain proper spacing
    cell.innerHTML = '&nbsp;';
  }
  
  row.appendChild(cell);
}
