import {loadCSV} from "./csvHandling.js";
import {initializeUI} from "./ui.js";

const EQUIPMENT_HEADERS = ['Character', 'Level', 'Weapon', 'Secondary', 'Emblem', 'Hat', 'Top', 'Bottom', 'Shoe', 'Cape', 'Gloves', 'Shoulder'];

/**
 * Get the equipment class based on equipment name
 * @param {string} equipment - The equipment name
 * @param {string} column - The column name (to check if it's secondary)
 * @returns {string} - CSS class name for the equipment
 */
function getEquipmentClass(equipment, column) {
    if (!equipment) return '';
    const lower = equipment.toLowerCase();

    switch (true) {
        case column === 'Secondary' && lower.includes('princess no'):
            return 'equipment-princess-no';
        case lower.includes('deimos'):
            return 'equipment-deimos';
        case lower.includes('evolving'):
            return 'equipment-evolving';
        case lower.includes('absolab') || lower.includes('abso lab'):
            return 'equipment-absolab';
        case lower.includes('root abyss') || lower.includes('cra'):
            return 'equipment-root-abyss';
        case lower.includes('arcane') || lower.includes('umbra'):
            return 'equipment-arcane';
        default:
            return '';
    }
}

/**
 * Creates a table cell with appropriate equipment class if applicable
 * @param {string} content - Cell content
 * @param {string} columnName - Name of the column
 * @returns {HTMLTableCellElement} - The created table cell
 */
function createTableCell(content, columnName) {
    const td = document.createElement('td');
    td.textContent = content || '';

    const equipmentClass = getEquipmentClass(content, columnName);
    if (equipmentClass) {
        td.className = equipmentClass;
    }

    return td;
}

/**
 * Renders the armor table with data from equipment.csv
 */
async function renderArmorTable() {
    try {
        // Load data
        const [accountData, equipmentData] = await Promise.all([
            loadCSV('account.csv'),
            loadCSV('equipment.csv')
        ]);

        // Create account map for quick lookups
        const accountMap = new Map(accountData.map(acc => [acc.IGN, acc]));

        // Set up table
        const table = document.getElementById('armorTable');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // Create headers
        thead.innerHTML = `
      <tr>
        ${EQUIPMENT_HEADERS.map(header => `<th>${header}</th>`).join('')}
      </tr>
    `;

        // Sort equipment data by level
        equipmentData.sort((a, b) => {
            const levelA = accountMap.get(a.IGN)?.level || 0;
            const levelB = accountMap.get(b.IGN)?.level || 0;
            return Number(levelB) - Number(levelA);
        });

        // Create rows
        tbody.innerHTML = '';
        equipmentData.forEach(row => {
            const tr = document.createElement('tr');

            // Add character and level
            tr.appendChild(createTableCell(row.IGN));
            tr.appendChild(createTableCell(accountMap.get(row.IGN)?.level || ''));

            // Add equipment cells
            EQUIPMENT_HEADERS.slice(2).forEach(header => {
                tr.appendChild(createTableCell(row[header], header));
            });

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error rendering armor table:', error);
    }
}

// Initialize if we're on the armor page
if (document.getElementById('armorTable')) {
    initializeUI();
    renderArmorTable();
}

export {renderArmorTable};
