import {loadCSV} from "./csvHandling.js";

export function calculateSymbolForce(levels, baseForce, levelMultiplier) {
    if (!levels) return '';
    
    // Check if any symbols are above level 0
    const hasSymbols = levels.some(lvl => lvl > 0);
    if (!hasSymbols) return '';

    // Return total symbol value
    return levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        return sum + baseForce + levelMultiplier * (lvl - 1);
    }, 0);
}

/**
 * Utility function to get display value for a symbol level
 * @param {number} level - The symbol level
 * @returns {string|number} - Empty string if level is 0, otherwise the level
 */
export function getSymbolDisplayValue(level) {
    return level === 0 ? '' : level;
}

/**
 * Returns configuration for a specific symbol type
 * @param {string} type - Either 'arcane' or 'sacred'
 * @returns {Object} Configuration object with csvFile and tableId
 */
function getSymbolTypeInfo(type) {
    const typeMap = {
        'arcane': {csvFile: 'arcane.csv', tableId: 'arcaneTable'},
        'sacred': {csvFile: 'sacred.csv', tableId: 'sacredTable'},
        'sacred2': {csvFile: 'sacred2.csv', tableId: 'sacred2Table'}
    };
    return typeMap[type] || {};
}


/**
 * Renders the detailed symbol information table in the DOM for a given type of symbol.
 * @param {string} type - The type of symbol to render (e.g., sacred, arcane).
 * @return {Promise<void>} A promise that resolves when the symbol details are successfully rendered.
 */
export async function renderSymbolsDetail(type) {
    try {
        const {csvFile, tableId} = getSymbolTypeInfo(type);

        const [symbolData, accountData] = await Promise.all([
            loadCSV(csvFile),
            loadCSV('account.csv')
        ]);

        // Create level map for quick access
        const levelMap = new Map(accountData.map(char => [char.ign, char.level]));

        // Get symbol names (all column names except IGN)
        const columns = Object.keys(symbolData[0] || {}).filter(key => key !== 'IGN');

        const thead = document.querySelector(`#${tableId} thead`);
        const tbody = document.querySelector(`#${tableId} tbody`);

        // Clear existing content
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th>IGN</th><th>Level</th>`;
        columns.forEach(symbol => {
            headerRow.innerHTML += `<th>${symbol}</th>`;
        });
        thead.appendChild(headerRow);

        // Create a row for each character
        symbolData.forEach(char => {
            const tr = document.createElement('tr');

            // Add IGN cell
            const ignCell = document.createElement('td');
            ignCell.textContent = char.IGN || '';
            tr.appendChild(ignCell);

            // Add Level cell
            const levelCell = document.createElement('td');
            levelCell.textContent = levelMap.get(char.IGN) || '';
            tr.appendChild(levelCell);

            // Add symbol level cells
            columns.forEach(symbol => {
                const td = document.createElement('td');
                const symbolValue = char[symbol] || '0';
                // For sacred symbols, don't show level 0 symbols
                if (symbolValue === '0' || symbolValue === 0) {
                    td.textContent = '';
                } else {
                    td.textContent = symbolValue;
                }
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(`Error rendering ${type} symbol details:`, err);
    }
}