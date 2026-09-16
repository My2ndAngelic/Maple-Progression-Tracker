import {prepareTable} from './tableUtils.js';
import {initializeUI} from './ui.js';
import {loadCSV} from './csvHandling.js';

let innerAbilityTypes = {};
let innerAbilityTypesPromise;

export function loadInnerAbilityTypes() {
    if (!innerAbilityTypesPromise) {
        innerAbilityTypesPromise = loadCSV('innerability_max.csv').then(typeData => {
            typeData.forEach(row => {
                if (!row.type) return;
                innerAbilityTypes[row.type.toLowerCase()] = {
                    rare: row.rare !== '' ? parseInt(row.rare) : undefined,
                    epic: row.epic !== '' ? parseInt(row.epic) : undefined,
                    unique: row.unique !== '' ? parseInt(row.unique) : undefined,
                    legendary: row.legendary !== '' ? parseInt(row.legendary) : undefined,
                    description: row.description || ''
                };
            });
        }).catch(error => {
            innerAbilityTypesPromise = undefined;
            throw error;
        });
    }
    return innerAbilityTypesPromise;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('innerAbilityTable')) return;

    // Initialize the UI (adds navbar)
    initializeUI();

    try {
        // Load inner ability type data (max tier values + description templates)
        await loadInnerAbilityTypes();

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

        accountMap.set(ign, {jobName, level});
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
        const accountInfo = accountMap.get(ign) || {level: 'N/A'};

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
        addIACell(row, character.p1ia1);
        addIACell(row, character.p1ia2);
        addIACell(row, character.p1ia3);
        addIACell(row, character.p2ia1);
        addIACell(row, character.p2ia2);
        addIACell(row, character.p2ia3);
        addIACell(row, character.p3ia1);
        addIACell(row, character.p3ia2);
        addIACell(row, character.p3ia3);

        tbody.appendChild(row);
    });
}

/**
 * Get the full description of an inner ability
 * @param {string} ability - The abbreviated ability text from the CSV
 * @returns {string} The full description of the ability
 */
function getAbilityDescription(ability) {
    if (!ability) return '';

    // Handle multiple main stats (STR, DEX, INT, LUK) combinations
    const parts = ability.split(/\s+/);
    if (parts.length > 1) {
        // Check if all parts are main stats
        const isAllMainStats = parts.every(part => /^(STR|DEX|INT|LUK)/i.test(part));

        if (isAllMainStats) {
            return parts.map(part => getAbilityDescription(part)).join(', ');
        } else {
            // If not all main stats, treat as single ability
            return ability;
        }
    }

    // Extract the base ability type and value
    const match = ability.match(/([A-Za-z]+)([+-])(\d+)(?:%)?/);
    if (!match) return ability;

    const [, type, , value] = match;
    const typeLC = type.toLowerCase();
    const typeInfo = innerAbilityTypes[typeLC];
    if (!typeInfo || !typeInfo.description) return ability;

    return typeInfo.description
        .replaceAll('{VALUE}', value)
        .replaceAll('{TYPE}', type.toUpperCase());
}

/**
 * Check if an ability value is at its maximum for its tier and line
 * @param {HTMLElement} row - The table row element
 * @param {string} value - The inner ability value
 * @param {number} cellIndex - The index of the cell in the row
 */
function isMaxValue(ability, cellIndex) {
    if (!ability) return false;

    // Extract ability type and value
    const match = ability.match(/([a-z]+)([+-])(\d+)(?:%)?/i);
    if (!match) return false;

    const [, type, , value] = match;
    const typeLC = type.toLowerCase();
    const numValue = parseInt(value);

    // Determine if this is line 1, 2, or 3 based on cell index
    // Each preset has 3 lines, starting at index 2 (after IGN and Level columns)
    const lineNumber = ((cellIndex - 2) % 3) + 1;

    const maxValues = innerAbilityTypes[typeLC];
    if (!maxValues) return false;

    // For line 1, check against Legendary values
    if (lineNumber === 1) {
        if (!maxValues.legendary) return false;
        return numValue === maxValues.legendary;
    }

    // For lines 2 and 3, check against Unique values
    if (!maxValues.unique) return false;
    return numValue >= maxValues.unique;
}

/**
 * Add a cell to the inner ability table
 * @param {HTMLElement} row - The row to add the cell to
 * @param {string} value - The value to add to the cell
 * @param {string} tooltip - Optional tooltip text
 */
function addIACell(row, value, tooltip = '') {
    const cell = document.createElement('td');

    if (value) {
        // Add ability type class for coloring
        const abilityType = value.match(/^([a-z]+)/i)?.[1]?.toLowerCase();
        if (abilityType) {
            cell.classList.add(`ability-${abilityType}`);
        }

        // Check if it's a max value and should be bold based on the line number
        const cellIndex = row.cells.length; // Get the index where this cell will be added
        if (isMaxValue(value, cellIndex)) {
            cell.style.fontWeight = 'bold';
        }

        // Display the full description instead of abbreviated value
        const description = getAbilityDescription(value);
        cell.textContent = description || value;
        
        // Remove tooltip functionality completely
    }

    row.appendChild(cell);
}

// Export the getAbilityDescription function
export { getAbilityDescription };
