import { loadData } from "./dataHandling.js";
import { createTableCell, prepareTable, sortAccountsByLevel } from "./tableUtils.js";

/**
 * Creates a table row for the progression view
 * @param {Object} char - Character data
 * @param {Object} job - Job data
 * @returns {HTMLTableRowElement} - The created table row
 */
export function createProgressionRow(ign, charData, jobData) {
    const tr = document.createElement('tr');
    const cellData = [
        ign || '',
        charData.basic.level || '',
        jobData.faction || '',
        jobData.archetype || '',
        jobData.jobName || '',
        jobData.mainstat || ''
    ];
    
    cellData.forEach((text, index) => {
        const cell = createTableCell(text);
        // Add archetype color class to the archetype column (index 3)
        if (index === 3 && text) {
            const archetypes = text.toLowerCase().split(' ');
            if (archetypes.length > 1) {
                // For hybrid classes like Xenon
                cell.classList.add(archetypes.join('-'));
            } else {
                cell.classList.add(archetypes[0]);
            }
        }
        tr.appendChild(cell);
    });
    return tr;
}

/**
 * Renders the progression table
 */
export async function renderProgressionTable() {
    try {
        // Load all data from YAML files
        const data = await loadData();
        const { characters, jobs } = data;
        
        // Set up table headers
        const table = document.getElementById('progressionTable');
        const thead = table.querySelector('thead');
        thead.innerHTML = `
            <tr>
                <th>Character</th>
                <th>Level</th>
                <th>Faction</th>
                <th>Archetype</th>
                <th>Class</th>
                <th>Main Stat</th>
            </tr>
        `;

        // Prepare table and get tbody reference
        const tbody = prepareTable('progressionTable');

        // Create a job map for faster lookups
        const jobMap = {};
        jobs.forEach(job => {
            jobMap[job.jobName.toLowerCase()] = job;
        });

        console.log('Available jobs:', Object.keys(jobMap)); // Debug log

        // Sort characters by level
        const sortedEntries = Object.entries(characters)
            .filter(([, char]) => {
                // Filter out characters without required data
                const hasData = char.basic && char.basic.level && char.basic.job_name;
                if (!hasData) {
                    console.log('Skipping character missing basic data:', char);
                }
                return hasData;
            })
            .sort(([, a], [, b]) => Number(b.basic.level) - Number(a.basic.level));
            
        // Create rows
        for (const [ign, charData] of sortedEntries) {
            // Look up job using case-insensitive matching
            const jobKey = charData.basic.job_name.toLowerCase();
            const job = jobMap[jobKey];
            
            if (job) {
                const row = createProgressionRow(ign, charData, job);
                tbody.appendChild(row);
            } else {
                console.log('No job found for:', jobKey); // Debug which jobs are missing
            }
        }

    } catch (err) {
        console.error('Error rendering progression table:', err);
    }
}

// Initialize progression page
if (document.getElementById('progressionTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderProgressionTable();
    });
}
