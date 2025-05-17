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
  const tr = document.createElement('tr');
  const cellData = [
    char.IGN || '',
    char.level || '',
    job.faction || '',
    job.archetype || '',
    job.fullName || ''
  ];

  cellData.forEach(text => {
    tr.appendChild(createTableCell(text));
  });
  return tr;
}

/**
 * Renders the progression table with data from account.csv and joblist.csv
 */
export async function renderProgressionTable() {
  try {
    const [accountData, jobList] = await Promise.all([
      loadCSV('account.csv'),
      loadCSV('joblist.csv')
    ]);

    const jobMap = createDataMap(jobList, 'jobName');
    sortAccountsByLevel(accountData);
    
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
