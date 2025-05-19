import {sortByLevelFactionArchetype} from "./tableUtils.js";

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
 * @returns {Object} Configuration object with tableId, headers and maxLevel
 */
function getSymbolTypeInfo(type) {
    const typeMap = {
        'arcane': {
            tableId: 'arcaneTable',
            headers: ['Character', 'Level', 'Vanishing Journey', 'Chu Chu Island', 'Lachelein', 'Arcana', 'Morass', 'Esfera'],
            maxLevel: 20
        },
        'sacred': {
            tableId: 'sacredTable',
            headers: ['Character', 'Level', 'Cernium', 'Hotel Arcus', 'Odium', 'Shangri-La', 'Arteria', 'Carcion'],
            maxLevel: 11
        }
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
        const {tableId, headers, maxLevel} = getSymbolTypeInfo(type);

        // Load all required YAML data
        const [databaseYaml, symbolYaml, joblistYaml] = await Promise.all([
            fetch('../data/database.yaml').then(r => r.text()),
            fetch('../data/symbol.yaml').then(r => r.text()),
            fetch('../data/joblist.yaml').then(r => r.text())
        ]);
        
        const database = jsyaml.load(databaseYaml);
        const symbolData = jsyaml.load(symbolYaml);
        const jobList = jsyaml.load(joblistYaml);

        // Get list of symbol areas for this type
        const symbolRegions = symbolData.regions[type].areas;

        // Create job map for sorting, using jobName instead of name
        const jobMap = {};
        jobList.jobs.forEach(job => {
            jobMap[job.jobName] = job;
        });

        // Transform character data into flat format for the table
        const tableData = Object.entries(database.characters)
            .map(([charName, charData]) => {
                // Basic character info
                const entry = {
                    IGN: charName,
                    level: charData.basic?.level || '',
                    jobName: charData.basic?.job_name || ''
                };

                // Add symbol levels from the symbols section
                const symbols = charData.symbols?.[type] || {};
                symbolRegions.forEach(region => {
                    entry[region] = symbols[region] || 0;
                });

                return entry;
            })
            .filter(char => char.IGN && char.level && char.jobName); // Only include characters with complete info

        console.log('Found characters:', tableData.length); // Debug log
        console.log('Job map:', Object.keys(jobMap)); // Debug log

        // Sort the data
        sortByLevelFactionArchetype(tableData, jobMap);

        // Get table elements and clear them
        const table = document.getElementById(tableId);
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
        thead.appendChild(headerRow);

        // Create a row for each character
        console.log('Rendering characters...'); // Debug log
        tableData.forEach((char, index) => {
            console.log(`Character ${index + 1}:`, char.IGN, char.jobName); // Debug character info
            const tr = document.createElement('tr');
            
            // Add IGN and Level cells
            tr.innerHTML = `<td>${char.IGN}</td><td>${char.level}</td>`;

            // Add symbol level cells
            symbolRegions.forEach(region => {
                const td = document.createElement('td');
                const symbolValue = char[region] || 0;
                
                if (symbolValue === 0) {
                    td.textContent = '';
                } else {
                    td.textContent = symbolValue;
                    if (symbolValue === maxLevel) {
                        td.classList.add('symbol-max');
                    }
                }
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        console.log('Total rows rendered:', tbody.children.length); // Debug log
    } catch (err) {
        console.error(`Error rendering ${type} symbol details:`, err);
        console.error('Stack:', err.stack); // More detailed error info
        throw err;
    }
}