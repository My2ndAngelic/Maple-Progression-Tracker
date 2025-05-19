/**
 * Loads data from YAML files
 * @returns {Promise<Object>} The parsed data
 */
export async function loadData() {
    try {
        const [database, jobList, symbol] = await Promise.all([
            fetch('../data/database.yaml').then(r => r.text()),
            fetch('../data/joblist.yaml').then(r => r.text()),
            fetch('../data/symbol.yaml').then(r => r.text())
        ]);

        const data = {
            characters: jsyaml.load(database).characters,
            jobs: jsyaml.load(jobList).jobs,
            regions: jsyaml.load(symbol).regions
        };

        return data;
    } catch (err) {
        console.error('Error loading data:', err);
        throw err;
    }
}

/**
 * Loads job data from joblist.yaml
 * @returns {Promise<Object>} The parsed job data
 */
export async function loadJobList() {
    try {
        const response = await fetch('../data/joblist.yaml');
        const text = await response.text();
        return yaml.load(text);
    } catch (err) {
        console.error('Error loading job list:', err);
        throw err;
    }
}

/**
 * Creates a map of character levels from the database
 * @param {Object} database - The database object
 * @returns {Map<string, number>} Map of character IGNs to their levels
 */
export function createLevelMap(database) {
    const levelMap = new Map();
    Object.entries(database.characters).forEach(([ign, data]) => {
        levelMap.set(ign, data.basic.level);
    });
    return levelMap;
}

/**
 * Get job information for a character
 * @param {Object} database - The database object
 * @param {Object} jobList - The job list object
 * @param {string} ign - The character's IGN
 * @returns {Object|null} The job information or null if not found
 */
export function getCharacterJob(database, jobList, ign) {
    const character = database.characters[ign];
    if (!character) return null;
    
    return jobList.jobs.find(job => job.jobName === character.basic.jobName);
}

/**
 * Get all characters of a specific job class
 * @param {Object} database - The database object
 * @param {string} jobName - The job name to filter by
 * @returns {Array<Object>} Array of character data
 */
export function getCharactersByJob(database, jobName) {
    return Object.entries(database.characters)
        .filter(([_, data]) => data.basic.jobName === jobName)
        .map(([ign, data]) => ({ign, ...data}));
}

/**
 * Get all characters of a specific faction
 * @param {Object} database - The database object
 * @param {Object} jobList - The job list object
 * @param {string} faction - The faction to filter by
 * @returns {Array<Object>} Array of character data
 */
export function getCharactersByFaction(database, jobList, faction) {
    const jobsInFaction = jobList.jobs
        .filter(job => job.faction === faction)
        .map(job => job.jobName);
    
    return Object.entries(database.characters)
        .filter(([_, data]) => jobsInFaction.includes(data.basic.jobName))
        .map(([ign, data]) => ({ign, ...data}));
}

/**
 * Get equipment set completion for a character
 * @param {Object} database - The database object
 * @param {string} ign - The character's IGN
 * @param {string} setName - The equipment set name
 * @returns {Object} Set completion information
 */
export function getEquipmentSetCompletion(database, ign, setName) {
    const character = database.characters[ign];
    if (!character) return null;
    
    const setInfo = database.equipment.sets.find(set => set.name === setName);
    if (!setInfo) return null;
    
    const equipment = character.equipment;
    const completedPieces = setInfo.slots.filter(slot => equipment[slot] === setName);
    
    return {
        setName,
        totalPieces: setInfo.slots.length,
        completedPieces: completedPieces.length,
        pieces: completedPieces
    };
}
