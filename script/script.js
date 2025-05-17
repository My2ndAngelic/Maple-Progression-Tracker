import {calculateArcaneForce, calculateArcaneStat} from "./arcane.js";
import {calculateSacredForce, calculateSacredStat} from "./sacred.js";
import {prepareTable, sortAccountsByLevel, sortByLevelFactionArchetype} from "./tableUtils.js";
import {renderEquipmentTable} from "./equipment.js";
import {renderCashTable} from "./cash.js";
import {renderProgressionTable} from "./progression.js";
import {loadCSV, createDataMap, createSymbolsMap} from "./csvHandling.js";

import {renderSymbolsDetail} from "./symbolUtils.js";

function createTableRow(char, job, arcanePower, arcaneStat, sacredForce, sacredStat) {
  const tr = document.createElement('tr');
  const cellData = [
    char.IGN || '',
    char.level || '',
    // job.linkSkillMaxLevel || '',  // Link Skill column commented out
    arcanePower,
    arcaneStat,
    sacredForce,
    sacredStat
  ];

  cellData.forEach((text, index) => {
    const td = document.createElement('td');
    
    // Special handling for arcane columns (index 2 and 3)
    if (index === 2 || index === 3) {
      // Hide cell content if it's 0, undefined, null, or empty string
      if (text === 0 || text === '0' || text === undefined || text === null || text === '') {
        td.textContent = '';
      } else {
        td.textContent = text;
      }
    } else {
      // Default handling for other columns
      td.textContent = text !== undefined && text !== null ? text : '';
    }
    
    tr.appendChild(td);
  });
  return tr;
}

function setView(viewId) {
  document.querySelectorAll('#overviewView, #progressionView, #arcaneView, #sacredView, #equipmentView, #cashView').forEach(div => {
    div.classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}

export async function renderTable() {
  try {
    const [accountData, jobList, arcaneData, sacredData] = await Promise.all([      loadCSV('data/account.csv'),
      loadCSV('data/joblist.csv'),
      loadCSV('data/arcane.csv'),
      loadCSV('data/sacred.csv')
    ]);

    const jobMap = createDataMap(jobList, 'jobName');
    const arcaneMap = createSymbolsMap(arcaneData);
    const sacredMap = createSymbolsMap(sacredData);

    sortByLevelFactionArchetype(accountData, jobMap);
    const tbody = prepareTable('charTable');

    accountData.forEach(char => {
      const job = jobMap[char.jobName];
      if (!job) {
        console.warn(`Job not found for jobName: "${char.jobName}"`);
        return;
      }

      const arcanePower = calculateArcaneForce(arcaneMap[char.IGN]);
      const arcaneStat = calculateArcaneStat(arcaneMap[char.IGN], char.jobName);
      const sacredForce = calculateSacredForce(sacredMap[char.IGN]);
      const sacredStat = calculateSacredStat(sacredMap[char.IGN], char.jobName);
      
      const row = createTableRow(char, job, arcanePower, arcaneStat, sacredForce, sacredStat);
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderTable();

  document.getElementById('overviewBtn').addEventListener('click', () => {
    setView('overviewView');
    renderTable();
  });

  document.getElementById('progressionBtn').addEventListener('click', () => {
    setView('progressionView');
    renderProgressionTable();
  });

  document.getElementById('equipmentBtn').addEventListener('click', () => {
    setView('equipmentView');
    renderEquipmentTable();
  });

  document.getElementById('cashBtn').addEventListener('click', () => {
    setView('cashView');
    renderCashTable();
  });

  document.getElementById('arcaneBtn').addEventListener('click', () => {
    setView('arcaneView');
    renderSymbolsDetail('arcane');
  });

  document.getElementById('sacredBtn').addEventListener('click', () => {
    setView('sacredView');
    renderSymbolsDetail('sacred');
  });

  const themeLink = document.getElementById('themeStylesheet');
  const darkToggleBtn = document.getElementById('darkModeToggle');

  darkToggleBtn.addEventListener('click', () => {
    const isDark = themeLink.getAttribute('href') === 'style-dark.css';
    themeLink.setAttribute('href', isDark ? 'style.css' : 'style-dark.css');
    darkToggleBtn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
  });
});
