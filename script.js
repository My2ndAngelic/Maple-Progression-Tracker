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

async function loadYAML(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const text = await res.text();
    return jsyaml.load(text);
}

async function loadCSV(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const text = await res.text();
    return parseCSV(text);
}

async function renderTable() {
    try {
        console.log('Loading account.yaml...');
        const accountData = await loadYAML('account.yaml');
        console.log('Loading joblist.csv...');
        const jobList = await loadCSV('joblist.csv');

        // Map jobName → job details
        const jobMap = {};
        jobList.forEach(job => {
            jobMap[job.jobName] = job;
        });

        const tbody = document.querySelector('#charTable tbody');
        tbody.innerHTML = '';

        accountData.characters.forEach(char => {
            const job = jobMap[char.jobName];
            if (!job) {
                console.warn(`Job not found for jobName: "${char.jobName}"`);
                return;
            }

            const tr = document.createElement('tr');

            [job.faction, job.archetype, job.fullName, char.ign, job.linkSkillMaxLevel].forEach(text => {
                const td = document.createElement('td');
                td.textContent = text || 'N/A';
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
        console.log('Table rendered successfully.');
    } catch (err) {
        console.error('Error:', err);
    }
}

window.addEventListener('DOMContentLoaded', renderTable);
