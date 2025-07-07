import {prepareTable} from './tableUtils.js';
import {initializeUI} from './ui.js';

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
// Maximum legendary tier values for inner abilities
const MAX_LEGENDARY_VALUES = {
    // Attack Speed & Special
    'as': 1,
    'passive': 1,
    'aoe': 1,

    // Stats
    'str': 40,
    'dex': 40,
    'int': 40,
    'luk': 40,
    'hp': 600,
    'mp': 600,
    'att': 30,
    'matt': 30,
    'allstat': 40,

    // Defense
    'defp': 20,
    'fddef': 50,
    'deff': 500,

    // All possible stat conversions
    'str2dex': 10, 'str2int': 10, 'str2luk': 10,
    'dex2str': 10, 'dex2int': 10, 'dex2luk': 10,
    'int2str': 10, 'int2dex': 10, 'int2luk': 10,
    'luk2str': 10, 'luk2dex': 10, 'luk2int': 10,

    // Boss
    'boss': 20,

    // Level-based
    'attlvl': 10,
    'mattlvl': 10,

    // Damage types
    'normal': 10,
    'abnormal': 10,

    // Drop rates
    'item': 20,
    'meso': 20,

    // Critical and buffs
    'crit': 30,
    'buff': 50,

    // Cooldown
    'cdskip': 20,

    // DEF conversion
    'deffd': 50
};

// Maximum unique tier values for inner abilities (for lines 2 and 3)
const MAX_UNIQUE_VALUES = {
    // Stats
    'str': 30,
    'dex': 30,
    'int': 30,
    'luk': 30,
    'hp': 450,
    'mp': 450,
    'att': 21,
    'matt': 21,
    'allstat': 30,

    // Defense
    'defp': 15,
    'deff': 350,
    'fddef': 35,

    // All possible stat conversions
    'str2dex': 8, 'str2int': 8, 'str2luk': 8,
    'dex2str': 8, 'dex2int': 8, 'dex2luk': 8,
    'int2str': 8, 'int2dex': 8, 'int2luk': 8,
    'luk2str': 8, 'luk2dex': 8, 'luk2int': 8,

    // Defense and Boss
    'boss': 15,

    // Level-based
    'attlvl': 8,
    'mattlvl': 8,

    // Damage types
    'normal': 8,
    'abnormal': 8,

    // Drop rates
    'item': 15,
    'meso': 15,

    // Critical and buffs
    'crit': 25,
    'buff': 35,

    // Cooldown
    'cdskip': 15,

    // DEF conversion
    'deffd': 35
};

function getAbilityDescription(ability) {
    if (!ability) return '';

    // Handle multiple main stats (STR, DEX, INT, LUK) combinations
    const parts = ability.split(/\s+/);
    if (parts.length > 1) {
        // Check if all parts are main stats
        const isAllMainStats = parts.every(part => {
            const type = part.match(/^(STR|DEX|INT|LUK)/i);
            return type !== null;
        });

        if (isAllMainStats) {
            const descriptions = parts.map(part => getAbilityDescription(part));
            return descriptions.join(', ');
        } else {
            // If not all main stats, treat as single ability
            return ability;
        }
    }

    // Extract the base ability type and value
    const match = ability.match(/([A-Za-z]+)([+-])(\d+)(?:%)?/);
    if (!match) return ability;

    const [, type, sign, value] = match;
    const typeLC = type.toLowerCase();

    switch (typeLC) {
        // Basic Stats
        case 'str':
            return `STR: ${sign}${value}`;
        case 'dex':
            return `DEX: ${sign}${value}`;
        case 'int':
            return `INT: ${sign}${value}`;
        case 'luk':
            return `LUK: ${sign}${value}`;
        case 'hp':
            return `Max HP: ${sign}${value}%`;
        case 'mp':
            return `Max MP: ${sign}${value}%`;
        case 'att':
            return `Attack ${sign}${value}`;
        case 'matt':
            return `Magic Attack ${sign}${value}`;
        case 'damage':
            return `Damage ${sign}${value}%`;
        case 'crit':
            return `Critical Rate: ${sign}${value}%`;
        case 'allstat':
            return `All Stats ${sign}${value}`;

        // Special Stats
        case 'as':
            return `Attack Speed ${sign}${value} level`;
        case 'boss':
            return `Boss Damage ${sign}${value}%`;
        case 'cdskip':
            return `${value}% chance to skip cooldowns`;
        case 'meso':
            return `Mesos Obtained: ${sign}${value}%`;
        case 'item':
            return `Item Drop Rate ${sign}${value}%`;
        case 'passive':
            return `Passive Skills ${sign}${value} Level`;
        case 'abnormal':
            return `${sign}${value}% damage when attacking targets inflicted with Abnormal Status.`;
        case 'buff':
            return `Buff Duration ${sign}${value}%`;
        case 'normal':
            return `${value}% damage to normal mosters`;
        case 'aoe':
            return `Enemies Hit by Multi-target Skills ${sign}${value}`;

        // Defense Stats
        case 'defp':
            return `Defense ${sign}${value}%`;
        case 'fddef':
            return `Final Damage ${sign}${value}% of DEF`;
        case 'deff':
            return `Increased defense ${sign}${value}`;

        // Special conversions - handle all stat conversion combinations
        case 'str2dex':
        case 'str2int':
        case 'str2luk':
        case 'dex2str':
        case 'dex2int':
        case 'dex2luk':
        case 'int2str':
        case 'int2dex':
        case 'int2luk':
        case 'luk2str':
        case 'luk2dex':
        case 'luk2int': {
            const [fromStat, toStat] = typeLC.split('2');
            return `${value}% of AP assigned to ${fromStat.toUpperCase()} added to ${toStat.toUpperCase()}`;
        }
        case 'attlvl':
            return `Attack ${sign}1 for every ${value} levels`;
        case 'mattlvl':
            return `Magic Attack ${sign}1 for every ${value} levels`;

        default:
            return ability;
    }
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

    // For line 1, check against Legendary values
    if (lineNumber === 1) {
        const maxLegendaryValue = MAX_LEGENDARY_VALUES[typeLC];
        if (!maxLegendaryValue) return false;
        return numValue === maxLegendaryValue;
    }

    // For lines 2 and 3, check against Unique values
    const maxUniqueValue = MAX_UNIQUE_VALUES[typeLC];
    if (!maxUniqueValue) return false;
    return numValue >= maxUniqueValue;
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
