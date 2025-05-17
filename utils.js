// utils.js
import { loadCSV } from './csvHandling.js';

/**
 * Creates and returns a table cell element with the given text content
 * @param {string} text - The text content for the cell
 * @param {string} [className] - Optional CSS class to add to the cell
 * @returns {HTMLTableCellElement} - The created td element
 */
export function createTableCell(text, className) {
  const td = document.createElement('td');
  td.textContent = text !== undefined && text !== null ? text : '';
  if (className) {
    td.classList.add(className);
  }
  return td;
}

/**
 * Sorts account data by level in descending order
 * @param {Array} accountData - The account data array to sort
 * @returns {Array} - The sorted account data array
 */
export function sortAccountsByLevel(accountData) {
  return accountData.sort((a, b) => Number(b.level) - Number(a.level));
}

/**
 * Prepares the table for rendering by clearing the tbody and returning reference
 * @param {string} tableId - The ID of the table to prepare
 * @returns {HTMLTableSectionElement} - The tbody element of the table
 */
export function prepareTable(tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = '';
  return tbody;
}

/**
 * Renders detailed symbol information for either arcane or sacred symbols
 * @param {string} type - Either 'arcane' or 'sacred' 
 */
export async function renderSymbolsDetail(type) {
    try {
        const csvFile = type === 'arcane' ? 'arcane.csv' : 'sacred.csv';
        const tableId = type === 'arcane' ? 'arcaneTable' : 'sacredTable';

        const [symbolData, accountData] = await Promise.all([
            loadCSV(csvFile),
            loadCSV('account.csv')
        ]);

        // Create level map for quick access
        const levelMap = new Map(accountData.map(char => [char.ign, char.level]));
        
        // Get symbol names (all column names except IGN)
        const columns = Object.keys(symbolData[0] || {}).filter(key => key !== 'IGN');
        
        const thead = document.querySelector(`#${tableId} thead`);
        const tbody = document.querySelector(`#${tableId} tbody`);
        
        // Clear existing content
        thead.innerHTML = '';
        tbody.innerHTML = '';
        
        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th>IGN</th><th>Level</th>`;
        columns.forEach(symbol => {
            headerRow.innerHTML += `<th>${symbol}</th>`;
        });
        thead.appendChild(headerRow);
        
        // Create a row for each character
        symbolData.forEach(char => {
            const tr = document.createElement('tr');
            
            // Add IGN cell
            const ignCell = document.createElement('td');
            ignCell.textContent = char.IGN || '';
            tr.appendChild(ignCell);
            
            // Add Level cell
            const levelCell = document.createElement('td');
            levelCell.textContent = levelMap.get(char.IGN) || '';
            tr.appendChild(levelCell);
            
            // Add symbol level cells
            columns.forEach(symbol => {
                const td = document.createElement('td');
                const symbolValue = char[symbol] || '0';
                // For both arcane and sacred symbols, don't show level 0 symbols
                if (symbolValue === '0' || symbolValue === 0) {
                    td.textContent = '';
                } else {
                    td.textContent = symbolValue;
                }
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(`Error rendering ${type} symbol details:`, err);
    }
}
