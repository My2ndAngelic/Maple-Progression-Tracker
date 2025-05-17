import { createTableCell } from "./utils.js";
import { loadCSV, createLevelMap } from "./csvHandling.js";
import { sortAccountsByLevel } from "./utils.js";
import { prepareTable } from "./tableUtils.js";

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
    sortAccountsByLevel(accountData);
    
    // Prepare table and get tbody reference
    const tbody = prepareTable('cashTable');

    // Create a level map for quick access to character levels
    const levelMap = createLevelMap(accountData);

    cashData.forEach(cash => {
      const tr = document.createElement('tr');
      
      // Add IGN cell
      tr.appendChild(createTableCell(cash.IGN || ''));
      
      // Add Level cell from account data
      tr.appendChild(createTableCell(levelMap.get(cash.IGN) || ''));
      
      // Add Petsnack cell with conditional formatting
      let petsnackValue = String(cash.Petsnack || '').trim();

      // Apply the CSS class only if the value is exactly "Yes"
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
