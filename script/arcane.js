import {calculateSymbolForce, renderSymbolsDetail} from './symbolUtils.js';

const ARCANE_BASE_FORCE = 30;
const ARCANE_LEVEL_MULTIPLIER = 10;
const ARCANE_BASE_STAT = 300;
const ARCANE_STAT_PER_LEVEL = 100;

export function calculateArcaneForce(levels) {
    return calculateSymbolForce(levels, ARCANE_BASE_FORCE, ARCANE_LEVEL_MULTIPLIER);
}

export function calculateArcaneStat(levels, jobName) {
    if (!levels) return '';

    // Check if any symbols are above level 0
    const hasSymbols = levels.some(lvl => lvl > 0);
    if (!hasSymbols) return '';

    // Calculate total stat from all symbols
    const totalStat = levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        // For level 1, we start with base stat (300)
        // For each level above 1, we add the per level increment (100)
        return sum + ARCANE_BASE_STAT + ARCANE_STAT_PER_LEVEL * (lvl - 1);
    }, 0);

    // Handle special cases for Xenon and Demon Avenger
    switch (jobName?.toLowerCase()) {
        case 'xenon':
            // Xenon gets 144 base and 48 per level for each of STR, DEX, and LUK
            const xenonTotal = levels.reduce((sum, lvl) => {
                if (lvl === 0) return sum;
                return sum + 144 + 48 * (lvl - 1);
            }, 0);
            return Math.floor(xenonTotal);
        case 'da':
            // Demon Avenger gets 6,300 base and 2,100 per level for HP
            const daTotal = levels.reduce((sum, lvl) => {
                if (lvl === 0) return sum;
                return sum + 6300 + 2100 * (lvl - 1);
            }, 0);
            return Math.floor(daTotal);
        default:
            return Math.floor(totalStat);
    }
}

// Arcane page initialization
if (document.getElementById('arcaneTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderSymbolsDetail('arcane');
    });
}
