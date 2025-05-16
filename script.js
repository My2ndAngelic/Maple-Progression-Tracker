function parseCSV(text) {
  const rows = [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const headers = [];

  let isHeaderParsed = false;

  for (const line of lines) {
    const row = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        row.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    row.push(cur.trim());

    if (!isHeaderParsed) {
      row.forEach(h => headers.push(h));
      isHeaderParsed = true;
    } else {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx] || '';
      });
      rows.push(obj);
    }
  }
  return rows;
}

async function loadCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const text = await res.text();
  return parseCSV(text);
}

// Calculate Arcane Force for a single symbol level
function calculateArcaneForSymbol(level) {
  const n = Number(level);
  if (isNaN(n) || n === 0) return 0;
  if (n === 1) return 30;
  return 30 + (n - 1) * 10;
}

async function renderTable() {
  try {
    const accountData = await loadCSV('account.csv');
    const jobList = await loadCSV('joblist.csv');
    const arcaneDataRaw = await loadCSV('arcane.csv');

    // Map jobName → job details
    const jobMap = {};
    jobList.forEach(job => {
      jobMap[job.jobName] = job;
    });

    // Map ign → arcane data row for fast lookup
    const arcaneMap = {};
    arcaneDataRaw.forEach(row => {
      arcaneMap[row.IGN] = row;
    });

    const tbody = document.querySelector('#charTable tbody');
    tbody.innerHTML = '';

    accountData.forEach(char => {
      const job = jobMap[char.jobName];
      if (!job) {
        console.warn(`Job not found for jobName: "${char.jobName}"`);
        return;
      }

      const arcaneEntry = arcaneMap[char.ign];
      let totalArcane = 0;
      if (arcaneEntry) {
        const levels = [
          arcaneEntry['Vanishing Journey'],
          arcaneEntry['Chu Chu Island'],
          arcaneEntry['Lachelin'],
          arcaneEntry['Arcana'],
          arcaneEntry['Morass'],
          arcaneEntry['Esfera']
        ];
        totalArcane = levels.reduce((sum, lvl) => sum + calculateArcaneForSymbol(lvl), 0);
      }

      const tr = document.createElement('tr');

      // faction | archetype | jobb | id (ign) | link skill max level | arcane
      [job.faction, job.archetype, job.fullName, char.ign, char.level, job.linkSkillMaxLevel, totalArcane].forEach(text => {
        const td = document.createElement('td');
        td.textContent = text || 'N/A';
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

window.addEventListener('DOMContentLoaded', renderTable);
