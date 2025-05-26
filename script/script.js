import {calculateArcaneForce, calculateArcaneStat} from "./arcane.js";
import {calculateSacredForce, calculateSacredStat} from "./sacred.js";
import {calculateGrandSacredForce, calculateGrandSacredStat, calculateGrandSacredExpBonus, calculateGrandSacredMesoBonus, calculateGrandSacredDropBonus} from "./grandsacred.js";
import {prepareTable, sortByLevelFactionArchetype} from "./tableUtils.js";
import {createDataMap, createSymbolsMap, loadCSV} from "./csvHandling.js";

function createTableRow(char, job, arcanePower, arcaneStat, totalSacredForce, sacredStat, expBonus, mesoBonus, dropBonus) {
    const tr = document.createElement('tr');
    const cellData = [
        char.IGN || '',
        char.level || '',
        // job.linkSkillMaxLevel || '',  // Link Skill column commented out
        arcanePower,
        arcaneStat,
        totalSacredForce,
        sacredStat,
        expBonus,
        mesoBonus,
        dropBonus
    ];

    cellData.forEach((text, index) => {
        const td = document.createElement('td');

        // Special handling for numerical columns (index 2-9)
        if (index >= 2 && index <= 9) {
            // Hide cell content if it's 0, undefined, null, or empty string
            if (text === 0 || text === '0' || text === undefined || text === null || text === '') {
                td.textContent = '';
            } else {
                td.textContent = text;
            }
        } else {
            // Default handling for other columns
            td.textContent = text !== undefined && text !== null ? text : '';
        }

        tr.appendChild(td);
    });
    return tr;
}

// setView function removed - unused

export async function renderTable() {
    try {
        const [accountData, jobList, arcaneData, sacredData, grandSacredData] = await Promise.all([
            loadCSV('data/account.csv'),
            loadCSV('data/joblist.csv'),
            loadCSV('data/arcane.csv'),
            loadCSV('data/sacred.csv'),
            loadCSV('data/grandsacred.csv')
        ]);

        const jobMap = createDataMap(jobList, 'jobName');
        const arcaneMap = createSymbolsMap(arcaneData);
        const sacredMap = createSymbolsMap(sacredData);
        const grandSacredMap = createSymbolsMap(grandSacredData);
        sortByLevelFactionArchetype(accountData, jobMap);
        const table = document.getElementById('charTable');

        // Set up table headers
        const thead = table.querySelector('thead');
        thead.innerHTML = `
      <tr>
        <th>Character</th>
        <th>Level</th>
        <th>Arcane Force</th>
        <th>Arcane Stats</th>
        <th>Sacred Force</th>
        <th>Sacred Stats</th>
        <th>EXP Bonus (%)</th>
        <th>Meso Bonus (%)</th>
        <th>Drop Bonus (%)</th>
      </tr>
    `;

        const tbody = prepareTable('charTable');

        accountData.forEach(char => {
            const job = jobMap[char.jobName];
            if (!job) {
                console.warn(`Job not found for jobName: "${char.jobName}"`);
                return;
            }

            const arcanePower = calculateArcaneForce(arcaneMap[char.IGN]);
            const arcaneStat = calculateArcaneStat(arcaneMap[char.IGN], char.jobName);
            const sacredForce = calculateSacredForce(sacredMap[char.IGN]);
            const sacredStat = calculateSacredStat(sacredMap[char.IGN], char.jobName);
            const grandSacredForce = calculateGrandSacredForce(grandSacredMap[char.IGN]);
            const expBonus = calculateGrandSacredExpBonus(grandSacredMap[char.IGN]);
            const mesoBonus = calculateGrandSacredMesoBonus(grandSacredMap[char.IGN]);
            const dropBonus = calculateGrandSacredDropBonus(grandSacredMap[char.IGN]);

            // Combine Sacred Force from both Sacred and Grand Sacred symbols
            const totalSacredForce = ((sacredForce === '' || isNaN(sacredForce) ? 0 : sacredForce) + 
                                    (grandSacredForce === '' || isNaN(grandSacredForce) ? 0 : grandSacredForce)) || '';

            const row = createTableRow(char, job, arcanePower, arcaneStat, totalSacredForce, sacredStat, 
                                      expBonus, mesoBonus, dropBonus);
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

// Overview page initialization
if (document.getElementById('charTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderTable();
    });
}
