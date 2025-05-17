import {loadCSV} from "./utils.js";

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
    accountData.sort((a, b) => Number(b.level) - Number(a.level));
    
    const tbody = document.querySelector('#equipmentTable tbody');
    tbody.innerHTML = '';

    // Create a level map for quick access to character levels
    const levelMap = new Map(accountData.map(char => [char.ign, char.level]));

    equipmentData.forEach(equipment => {
      const tr = document.createElement('tr');
      
      // Add IGN cell
      const ignCell = document.createElement('td');
      ignCell.textContent = equipment.IGN || '';
      tr.appendChild(ignCell);
      
      // Add Level cell from account data
      const levelCell = document.createElement('td');
      levelCell.textContent = levelMap.get(equipment.IGN) || '';
      tr.appendChild(levelCell);
      
      // Get all columns except IGN and Pet snack
      const columns = Object.keys(equipment).filter(key => key !== 'IGN' && key !== 'Pet snack');
      
      // Add equipment data cells
      columns.forEach(column => {
        const td = document.createElement('td');
        td.textContent = equipment[column] || '';
        
        // Add equipment-specific conditional formatting here if needed later
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error rendering equipment table:', err);
  }
}

/**
 * Renders the cash items table with data from cash.csv
 */
export async function renderCashTable() {
  try {
    const [accountData, cashData] = await Promise.all([
      loadCSV('account.csv'),
      loadCSV('cash.csv')
    ]);
    
    // Sort by level, descending
    accountData.sort((a, b) => Number(b.level) - Number(a.level));
    
    const tbody = document.querySelector('#cashTable tbody');
    tbody.innerHTML = '';

    // Create a level map for quick access to character levels
    const levelMap = new Map(accountData.map(char => [char.ign, char.level]));

    cashData.forEach(cash => {
      const tr = document.createElement('tr');
      
      // Add IGN cell
      const ignCell = document.createElement('td');
      ignCell.textContent = cash.IGN || '';
      tr.appendChild(ignCell);
      
      // Add Level cell from account data
      const levelCell = document.createElement('td');
      levelCell.textContent = levelMap.get(cash.IGN) || '';
      tr.appendChild(levelCell);
      
      // Add Petsnack cell
      const petsnackCell = document.createElement('td');
      petsnackCell.textContent = cash.Petsnack || '';
      
      // Add class for Petsnack if value is "Yes"
      if (cash.Petsnack === 'Yes') {
        petsnackCell.classList.add('pet-snack-yes');
      }
      
      tr.appendChild(petsnackCell);
      
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error rendering cash table:', err);
  }
}
