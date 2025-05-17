import {calculateSymbolForce} from './symbolUtils.js';

const ARCANE_BASE_FORCE = 30;
const ARCANE_LEVEL_MULTIPLIER = 10;
const ARCANE_BASE_STAT = 300;
const ARCANE_STAT_PER_LEVEL = 100;

export function calculateArcaneForce(levels) {
    return calculateSymbolForce(levels, ARCANE_BASE_FORCE, ARCANE_LEVEL_MULTIPLIER);
}

export function calculateArcaneStat(levels, jobName) {
    if (!levels) return '';

    // Calculate total stat from all symbols
    levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        // For level 1, we start with base stat (300)
        // For each level above 1, we add the per level increment (100)
        return sum + ARCANE_BASE_STAT + ARCANE_STAT_PER_LEVEL * (lvl - 1);
    }, 0);
}
