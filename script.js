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

function setView(viewId) {
  document.querySelectorAll('#overviewView, #arcaneView').forEach(div => {
    div.classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}

async function renderTable() {
  try {
    const accountData = await loadCSV('account.csv');
    const jobList = await loadCSV('joblist.csv');
    const arcaneData = await loadCSV('arcane.csv');
    const sacredData = await loadCSV('sacred.csv');

    const jobMap = {};
    jobList.forEach(job => {
      jobMap[job.jobName] = job;
    });

    const arcaneMap = {};
    arcaneData.forEach(row => {
      const { IGN, ...symbols } = row;
      arcaneMap[IGN] = Object.values(symbols).map(v => Number(v) || 0);
    });

    const sacredMap = {};
    sacredData.forEach(row => {
      const { IGN, ...symbols } = row;
      sacredMap[IGN] = Object.values(symbols).map(v => Number(v) || 0);
    });

    // Sort by level descending
    accountData.sort((a, b) => Number(b.level) - Number(a.level));

    const tbody = document.querySelector('#charTable tbody');
    tbody.innerHTML = '';

    accountData.forEach(char => {
      const job = jobMap[char.jobName];
      if (!job) {
        console.warn(`Job not found for jobName: "${char.jobName}"`);
        return;
      }

      let arcaneForce = '';
      if (arcaneMap[char.ign]) {
        arcaneForce = arcaneMap[char.ign].reduce((sum, lvl) => {
          if (lvl === 0) return sum;
          return sum + 30 + 10 * (lvl - 1);
        }, 0);
      }

      let sacredForce = '';
      if (sacredMap[char.ign]) {
        sacredForce = sacredMap[char.ign].reduce((sum, lvl) => {
          return sum + (lvl * 10);
        }, 0);
      }

      const tr = document.createElement('tr');
      [
        job.faction || '',
        job.archetype || '',
        job.fullName || '',
        char.ign || '',
        char.level || '',
        job.linkSkillMaxLevel || '',
        arcaneForce,
        sacredForce
      ].forEach(text => {
        const td = document.createElement('td');
        td.textContent = text !== undefined && text !== null ? text : '';
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

async function renderArcaneDetail() {
  try {
    const arcaneData = await loadCSV('arcane.csv');

    const columns = Object.keys(arcaneData[0] || {}).filter(k => k !== 'IGN');
    const thead = document.querySelector('#arcaneTable thead');
    const tbody = document.querySelector('#arcaneTable tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    const trHead = document.createElement('tr');
    trHead.appendChild(Object.assign(document.createElement('th'), { textContent: 'IGN' }));
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    arcaneData.forEach(row => {
      const tr = document.createElement('tr');
      const ignTd = document.createElement('td');
      ignTd.textContent = row.IGN;
      tr.appendChild(ignTd);

      columns.forEach(col => {
        const td = document.createElement('td');
        td.textContent = row[col] || '';
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading arcane details:', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderTable();
  document.getElementById('overviewBtn').addEventListener('click', () => {
    setView('overviewView');
    renderTable();
  });
  document.getElementById('arcaneBtn').addEventListener('click', () => {
    setView('arcaneView');
    renderArcaneDetail();
  });
});
