import {calculateSymbolForce, renderSymbolsDetail} from './symbolUtils.js';

const SACRED_BASE_FORCE = 10;
const SACRED_LEVEL_MULTIPLIER = 10;
const SACRED_BASE_STAT = 500;
const SACRED_STAT_PER_LEVEL = 200;

export function calculateSacredForce(levels) {
    return calculateSymbolForce(levels, SACRED_BASE_FORCE, SACRED_LEVEL_MULTIPLIER);
}

export function calculateSacredStat(levels, jobName) {
    if (!levels) return '';

    // Check if any symbols are above level 0
    const hasSymbols = levels.some(lvl => lvl > 0);
    if (!hasSymbols) return '';

    // Calculate total stat from all symbols
    const totalStat = levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        // For level 1, we start with base stat (500)
        // For each level above 1, we add the per level increment (200)
        return sum + SACRED_BASE_STAT + SACRED_STAT_PER_LEVEL * (lvl - 1);
    }, 0);

    // Handle special cases for Xenon and Demon Avenger
    switch (jobName) {
        case 'xenon':
            // Xenon gets 240 base and 96 per level for each of STR, DEX, and LUK
            return Math.floor(totalStat * 0.48); // 240/500 = 0.48 for the base ratio
        case 'da':
            // Demon Avenger gets 10,500 base and 4,200 per level for HP
            return Math.floor(totalStat * 21); // 10500/500 = 21 for the base ratio
        default:
            return totalStat;
    }
}

// Sacred page initialization
if (document.getElementById('sacredTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderSymbolsDetail('sacred');
    });
}
