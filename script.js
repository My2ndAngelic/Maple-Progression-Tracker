
import {calculateArcanePower, calculateArcaneStat} from "./arcane.js";
import {calculateSacredForce, calculateSacredStat} from "./sacred.js";
import {loadCSV, renderSymbolsDetail} from "./utils.js";
import {renderEquipmentTable, renderCashTable} from "./equipment.js";

function createDataMap(data, keyField) {
  const map = {};
  data.forEach(item => {
    const { [keyField]: key, ...rest } = item;
    map[key] = rest;
  });
  return map;
}

function createSymbolsMap(data) {
  const map = {};
  data.forEach(row => {
    const { IGN, ...symbols } = row;
    map[IGN] = Object.values(symbols).map(v => Number(v) || 0);
  });
  return map;
}

function createProgressionRow(char, job) {
  const tr = document.createElement('tr');
  const cellData = [
    char.ign || '',
    char.level || '',
    job.faction || '',
    job.archetype || '',
    job.fullName || ''
  ];

  cellData.forEach(text => {
    const td = document.createElement('td');
    td.textContent = text !== undefined && text !== null ? text : '';
    tr.appendChild(td);
  });
  return tr;
}

function createTableRow(char, job, arcanePower, arcaneStat, sacredForce, sacredStat) {
  const tr = document.createElement('tr');
  const cellData = [
    char.ign || '',
    char.level || '',
    // job.linkSkillMaxLevel || '',  // Link Skill column commented out
    arcanePower,
    arcaneStat,
    sacredForce,
    sacredStat
  ];

  cellData.forEach(text => {
    const td = document.createElement('td');
    td.textContent = text !== undefined && text !== null ? text : '';
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

async function renderProgressionTable() {
  try {
    const [accountData, jobList] = await Promise.all([
      loadCSV('account.csv'),
      loadCSV('joblist.csv')
    ]);

    const jobMap = createDataMap(jobList, 'jobName');
    accountData.sort((a, b) => Number(b.level) - Number(a.level));
    
    const tbody = document.querySelector('#progressionTable tbody');
    tbody.innerHTML = '';

    accountData.forEach(char => {
      const job = jobMap[char.jobName];
      if (!job) {
        console.warn(`Job not found for jobName: "${char.jobName}"`);
        return;
      }

      const row = createProgressionRow(char, job);
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

async function renderTable() {
  try {
    const [accountData, jobList, arcaneData, sacredData] = await Promise.all([
      loadCSV('account.csv'),
      loadCSV('joblist.csv'),
      loadCSV('arcane.csv'),
      loadCSV('sacred.csv')
    ]);

    const jobMap = createDataMap(jobList, 'jobName');
    const arcaneMap = createSymbolsMap(arcaneData);
    const sacredMap = createSymbolsMap(sacredData);

    accountData.sort((a, b) => Number(b.level) - Number(a.level));
    const tbody = document.querySelector('#charTable tbody');
    tbody.innerHTML = '';

    accountData.forEach(char => {
      const job = jobMap[char.jobName];
      if (!job) {
        console.warn(`Job not found for jobName: "${char.jobName}"`);
        return;
      }

      const arcanePower = calculateArcanePower(arcaneMap[char.ign]);
      const arcaneStat = calculateArcaneStat(arcaneMap[char.ign], char.jobName);
      const sacredForce = calculateSacredForce(sacredMap[char.ign]);
      const sacredStat = calculateSacredStat(sacredMap[char.ign], char.jobName);
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
