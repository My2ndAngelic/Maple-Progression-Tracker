import {calculateSymbolForce} from './symbolUtils.js';

const ARCANE_BASE_FORCE = 30;
const ARCANE_LEVEL_MULTIPLIER = 10;
const ARCANE_STAT_PER_LEVEL = 100;

export function calculateArcaneForce(levels) {
    return calculateSymbolForce(levels, ARCANE_BASE_FORCE, ARCANE_LEVEL_MULTIPLIER);
}

export function calculateArcaneStat(levels, jobName, charLevel) {
    if (!levels) return '';

    // Calculate total stat from all symbols
    const totalStat = levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        return sum + ARCANE_STAT_PER_LEVEL * lvl;
    }, 0);

    // Handle special cases for Xenon and Demon Avenger
    if (jobName === 'xenon') {
        // Xenon uses STR, DEX, and LUK, so divide the stat by 3
        return Math.floor(totalStat / 3);
    } else if (jobName === 'da') {
        // Demon Avenger uses HP, different calculation
        return Math.floor(totalStat * 15);
    }

    return totalStat;
}
