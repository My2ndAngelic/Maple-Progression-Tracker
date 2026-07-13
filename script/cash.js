import {createLevelMap, loadCSV} from "./csvHandling.js";
import {createTableCell, prepareTable, sortByLevelFactionArchetype} from "./tableUtils.js";

/**
 * Renders the cash items table with data from cash.csv
 */
export async function renderCashTable() {
    try {
        const [accountData, cashData, jobList] = await Promise.all([
            loadCSV('account.csv'),
            loadCSV('cash.csv'),
            loadCSV('joblist.csv')
        ]);

        // Create job map for sorting
        const jobMap = {};
        jobList.forEach(j => {
            jobMap[j.jobName] = j;
        });

        // Render from account roster so missing cash rows never hide characters.
        const cashMap = {};
        cashData.forEach(cash => {
            if (cash.IGN) cashMap[cash.IGN] = cash;
        });

        sortByLevelFactionArchetype(accountData, jobMap);

        // Set up table headers
        const table = document.getElementById('cashTable');
        const thead = table.querySelector('thead');
        thead.innerHTML = `
      <tr>
        <th>Character</th>
        <th>Level</th>
        <th>Pet Snack</th>
      </tr>
    `;

        // Prepare table and get tbody reference
        const tbody = prepareTable('cashTable');

        // Create a level map for quick access to character levels
        const levelMap = createLevelMap(accountData);

        accountData.forEach(char => {
            const tr = document.createElement('tr');
            const cash = cashMap[char.IGN] || {};

            // Add IGN cell
            tr.appendChild(createTableCell(char.IGN || ''));

            // Add Level cell from account data
            tr.appendChild(createTableCell(levelMap.get(char.IGN) || ''));

            // Add Petsnack cell with conditional formatting
            let petsnackValue = String(cash.Petsnack || '').trim();

            const td = document.createElement('td');
            td.textContent = petsnackValue;
            if (petsnackValue === 'Yes') {
                td.classList.add('pet-snack-yes');
            }
            tr.appendChild(td);

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error rendering cash table:', err);
    }
}

// Cash page initialization
if (document.getElementById('cashTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderCashTable();
    });
}
