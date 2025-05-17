import { loadCSV, createLevelMap } from "./csvHandling.js";
import { createTableCell, sortAccountsByLevel } from "./utils.js";
import { prepareTable } from "./tableUtils.js";

/**
 * Renders the equipment table with data from equipment.csv
 */
export async function renderEquipmentTable() {
  try {
    const [accountData, equipmentData] = await Promise.all([
      loadCSV('account.csv'),
      loadCSV('equipment.csv')
    ]);
    
    // Sort by level, descending
    sortAccountsByLevel(accountData);
    
    // Prepare table and get tbody reference
    const tbody = prepareTable('equipmentTable');

    // Create a level map for quick access to character levels
    const levelMap = createLevelMap(accountData);

    equipmentData.forEach(equipment => {
      const tr = document.createElement('tr');
      
      // Add IGN cell
      const ignCell = createTableCell(equipment.IGN || '');
      tr.appendChild(ignCell);
      
      // Add Level cell from account data
      const levelCell = createTableCell(levelMap.get(equipment.IGN) || '');
      tr.appendChild(levelCell);
      
      // Get all columns except IGN
      const columns = Object.keys(equipment).filter(key => key !== 'IGN');
      
      // Add equipment data cells
      columns.forEach(column => {
        tr.appendChild(createTableCell(equipment[column] || ''));
      });
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error rendering equipment table:', err);
  }
}
