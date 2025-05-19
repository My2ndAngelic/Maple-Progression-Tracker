import {createLevelMap, loadCSV} from "./csvHandling.js";
import {createTableCell, prepareTable, sortAccountsByLevel} from "./tableUtils.js";

const ACCESSORY_HEADERS = ['Character', 'Level', 'Face', 'Eye', 'Ear', 'Ring 1', 'Ring 2', 'Ring 3', 'Ring 4', 'Pendant 1', 'Pendant 2', 'Belt', 'Badge', 'Medal', 'Android', 'Heart'];

/**
 * Get the equipment class based on equipment name
 * @param {string} equipment - The equipment name
 * @returns {string} - CSS class name for the equipment
 */
function getAccessoryClass(equipment) {
    if (!equipment) return '';
    const lower = equipment.toLowerCase();

    switch (true) {
        case lower.includes('superior'):
            return 'equipment-superior';
        case lower.includes('meister'):
            return 'equipment-meister';
        case lower.includes('reinforced'):
            return 'equipment-reinforced';
        default:
            return '';
    }
}

/**
 * Renders the accessory table with data from accessory.csv
 */
export async function renderAccessoryTable() {
    try {
        const [accountData, accessoryData] = await Promise.all([
            loadCSV('data/account.csv'),
            loadCSV('data/accessory.csv')
        ]);

        // Sort by level, descending
        sortAccountsByLevel(accountData);

        // Set up table headers
        const table = document.getElementById('accessoryTable');
        const thead = table.querySelector('thead');
        thead.innerHTML = `
      <tr>
        ${ACCESSORY_HEADERS.map(header => `<th>${header}</th>`).join('')}
      </tr>
    `;

        // Prepare table and get tbody reference
        const tbody = prepareTable('accessoryTable');

        // Create a level map for quick access to character levels
        const levelMap = createLevelMap(accountData);

        accessoryData.forEach(accessory => {
            const tr = document.createElement('tr');

            // Add IGN cell
            const ignCell = createTableCell(accessory.IGN || '');
            tr.appendChild(ignCell);

            // Add Level cell from account data
            const levelCell = createTableCell(levelMap.get(accessory.IGN) || '');
            tr.appendChild(levelCell);

            // Add accessory data in the correct order
            const columns = ['Face', 'Eye', 'Ear', 'Ring 1', 'Ring 2', 'Ring 3', 'Ring 4', 'Pendant 1', 'Pendant 2', 'Belt', 'Badge', 'Medal', 'Android', 'Heart'];

            columns.forEach(column => {
                const value = accessory[column] || '';
                const cell = createTableCell(value);
                const accessoryClass = getAccessoryClass(value);
                if (accessoryClass) {
                    cell.classList.add(accessoryClass);
                }
                tr.appendChild(cell);
            });

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error rendering accessory table:', err);
    }
}

// Accessory page initialization
if (document.getElementById('accessoryTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderAccessoryTable();
    });
}
