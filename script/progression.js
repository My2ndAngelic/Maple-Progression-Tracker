import { createDataMap } from "./csvHandling.js";
import {createTableCell, sortAccountsByLevel} from "./tableUtils.js";
import { loadCSV } from "./csvHandling.js";
import { prepareTable } from "./tableUtils.js";

/**
 * Creates a table row for the progression view
 * @param {Object} char - Character data
 * @param {Object} job - Job data
 * @returns {HTMLTableRowElement} - The created table row
 */
export function createProgressionRow(char, job) {
  const tr = document.createElement('tr');  const cellData = [
    char.IGN || '',
    char.level || '',
    job.faction || '',
    job.archetype || '',
    job.fullName || '',
    job.mainstat || ''
  ];
  cellData.forEach((text, index) => {
    const cell = createTableCell(text);
    // Add archetype color class to the archetype column (index 3)
    if (index === 3 && text) {
      cell.classList.add(`archetype-${text.toLowerCase()}`);
    }
    tr.appendChild(cell);
  });
  return tr;
}

/**
 * Renders the progression table with data from account.csv and joblist.csv
 */
export async function renderProgressionTable() {
  try {
    const [accountData, jobList] = await Promise.all([      loadCSV('data/account.csv'),
      loadCSV('data/joblist.csv')
    ]);    const jobMap = createDataMap(jobList, 'jobName');
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
  import('./ui.js').then(({ initializeUI }) => {
    initializeUI();
    renderProgressionTable();
  });
}
