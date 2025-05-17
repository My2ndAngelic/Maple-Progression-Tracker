import { loadCSV, createLevelMap } from "./csvHandling.js";
import {createTableCell, prepareTable, sortAccountsByLevel} from "./tableUtils.js";

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
 * Renders the armor table with data from equipment.csv
 */
export async function renderArmorTable() {
  try {
    const [accountData, equipmentData] = await Promise.all([
      loadCSV('data/account.csv'),
      loadCSV('data/equipment.csv')
    ]);
    
    // Sort by level, descending
    sortAccountsByLevel(accountData);
      // Set up table headers
    const table = document.getElementById('armorTable');
    const thead = table.querySelector('thead');
    thead.innerHTML = `
      <tr>
        ${EQUIPMENT_HEADERS.map(header => `<th>${header}</th>`).join('')}
      </tr>
    `;

    // Prepare table and get tbody reference
    const tbody = prepareTable('armorTable');

    // Create a level map for quick access to character levels
    const levelMap = createLevelMap(accountData);

    equipmentData.forEach(equipment => {
      const tr = document.createElement('tr');
      
      // Add IGN cell
      const ignCell = createTableCell(equipment.IGN || '');
      tr.appendChild(ignCell);
      
      // Add Level cell from account data
      const levelCell = createTableCell(levelMap.get(equipment.IGN) || '');
      tr.appendChild(levelCell);      // Add equipment data in the correct order, using the exact column names from the CSV
      const columns = ['Weapon', 'Secondary', 'Emblem', 'Hat', 'Top', 'Bottom', 'Shoe', 'Cape', 'Gloves', 'Shoulder'];
      
      columns.forEach(column => {
        const value = equipment[column] || '';
        const cell = createTableCell(value);
        const equipClass = getEquipmentClass(value, column);
        if (equipClass) {
          cell.classList.add(equipClass);
        }
        tr.appendChild(cell);
      });
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error rendering armor table:', err);
  }
}

// For backward compatibility
export const renderEquipmentTable = renderArmorTable;

// Armor page initialization
if (document.getElementById('armorTable')) {
  import('./ui.js').then(({ initializeUI }) => {
    initializeUI();
    renderArmorTable();
  });
}
