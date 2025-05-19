import { loadYAML, createLevelMap } from "./dataHandling.js";
import { createTableCell, prepareTable, sortByLevelFactionArchetype } from "./tableUtils.js";

/**
 * Renders the cash items table with data from cash.yaml
 */
export async function renderCashTable() {
    try {
        const [accountData, cashData, jobList] = await Promise.all([
            loadYAML('account.yaml'),
            loadYAML('cash.yaml'),
            loadYAML('joblist.yaml')
        ]);

        // Create job map for sorting
        const jobMap = {};
        jobList.jobs.forEach(j => {
            jobMap[j.jobName] = j;
        });

        // Merge cashData with accountData for sorting
        const merged = cashData.cashItems.map(cash => {
            const acc = accountData.characters.find(a => a.ign === cash.ign) || {};
            return { ...cash, ...acc };
        });

        sortByLevelFactionArchetype(merged, jobMap);

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

        merged.forEach(cash => {
            const tr = document.createElement('tr');

            // Add IGN cell
            tr.appendChild(createTableCell(cash.ign || ''));

            // Add Level cell from account data
            tr.appendChild(createTableCell(levelMap.get(cash.ign) || ''));

            // Add Petsnack cell with conditional formatting
            const td = document.createElement('td');
            td.textContent = cash.petSnack ? 'Yes' : 'No';
            if (cash.petSnack) {
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
