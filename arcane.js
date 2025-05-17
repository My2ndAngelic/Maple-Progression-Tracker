import {calculateSymbolForce} from './symbolUtils.js';

const ARCANE_BASE_POWER = 30;
const ARCANE_LEVEL_MULTIPLIER = 10;
const ARCANE_BASE_STAT = 300;
const ARCANE_STAT_PER_LEVEL = 100;

export function calculateArcanePower(levels) {
    return calculateSymbolForce(levels, ARCANE_BASE_POWER, ARCANE_LEVEL_MULTIPLIER);
}

export function calculateArcaneStat(levels, jobName) {
    if (!levels) return '';

    // Calculate total stat from all symbols
    const totalStat = levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        // For level 1, we start with base stat (300)
        // For each level above 1, we add the per level increment (100)
        return sum + ARCANE_BASE_STAT + ARCANE_STAT_PER_LEVEL * (lvl - 1);
    }, 0);

    // Handle special cases for Xenon and Demon Avenger
    switch (jobName) {
        case 'xenon':
            // Xenon gets 144 base and 48 per level for each of STR, DEX, and LUK
            return Math.floor(totalStat * 0.48); // 144/300 = 0.48 for the base ratio
        case 'da':
            // Demon Avenger gets 6,300 base and 2,100 per level for HP 
            return Math.floor(totalStat * 21); // 6300/300 = 21 for the base ratio
        default:
            return totalStat;
    }
}
