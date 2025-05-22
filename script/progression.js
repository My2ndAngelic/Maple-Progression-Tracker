import {createDataMap, loadCSV} from "./csvHandling.js";
import {createTableCell, prepareTable, sortAccountsByLevel} from "./tableUtils.js";

/**
 * Creates a table row for the progression view
 * @param {Object} char - Character data
 * @param {Object} job - Job data
 * @returns {HTMLTableRowElement} - The created table row
 */
export function createProgressionRow(char, job) {
    const tr = document.createElement('tr');
    // Basic cell data without the links
    const cellData = [
        char.IGN || '',
        char.level || '',
        job.faction || '',
        job.archetype || '',
        job.fullName || '',
        job.mainstat || ''
    ];
    
    // Create regular cells
    cellData.forEach((text, index) => {
        const cell = createTableCell(text);
        // Add archetype color class to the archetype column (index 3)
        if (index === 3 && text) {
            cell.classList.add(`archetype-${text.toLowerCase()}`);
        }
        tr.appendChild(cell);
    });
    
    // Create the links cell (last column)
    const linksCell = document.createElement('td');
    
    // Find all properties in job that contain URLs
    const linkTypes = Object.keys(job).filter(key => {
        const value = job[key];
        return value && 
               typeof value === 'string' && 
               value.startsWith('http') &&
               key !== 'jobName' &&
               key !== 'faction' &&
               key !== 'archetype' &&
               key !== 'fullName' &&
               key !== 'mainstat';
    });
    
    // Create links for each URL found
    if (linkTypes.length > 0) {
        linkTypes.forEach((linkType, idx) => {
            const link = document.createElement('a');
            link.href = job[linkType];
            link.textContent = linkType;
            link.target = '_blank'; // Open in new tab
            link.className = 'progression-link';
            linksCell.appendChild(link);
            
            // Add separator between links
            if (idx < linkTypes.length - 1) {
                linksCell.appendChild(document.createTextNode(' | '));
            }
        });
    }
    
    tr.appendChild(linksCell);
    return tr;
}

/**
 * Renders the progression table with data from account.csv and joblist.csv
 */
export async function renderProgressionTable() {
    try {
        const [accountData, jobList] = await Promise.all([loadCSV('data/account.csv'),
            loadCSV('data/joblist.csv')
        ]);
        const jobMap = createDataMap(jobList, 'jobName');
        sortAccountsByLevel(accountData);

        // Set up table headers
        const table = document.getElementById('progressionTable');
        const thead = table.querySelector('thead');
        thead.innerHTML = `
      <tr>
        <th>Character</th>
        <th>Level</th>
        <th>Faction</th>
        <th>Archetype</th>
        <th>Class</th>
        <th>Main Stat</th>
        <th>Links</th>
      </tr>
    `;

        const tbody = prepareTable('progressionTable');

        accountData.forEach(char => {
            const job = jobMap[char.jobName];
            if (!job) {
                console.warn(`Job not found for jobName: "${char.jobName}"`);
                return;
            }

            const row = createProgressionRow(char, job);
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error rendering progression table:', err);
    }
}

// Progression page initialization
if (document.getElementById('progressionTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderProgressionTable();
    });
}
