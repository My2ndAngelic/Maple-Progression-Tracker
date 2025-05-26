import {calculateSymbolForce, renderSymbolsDetail} from './symbolUtils.js';

const GRAND_SACRED_BASE_FORCE = 10;
const GRAND_SACRED_LEVEL_MULTIPLIER = 10;
const GRAND_SACRED_BASE_EXP = 10;
const GRAND_SACRED_EXP_PER_LEVEL = 4;
const GRAND_SACRED_BASE_MESO = 5;
const GRAND_SACRED_MESO_PER_LEVEL = 1;
const GRAND_SACRED_BASE_DROP = 5;
const GRAND_SACRED_DROP_PER_LEVEL = 1;

export function calculateGrandSacredForce(levels) {
    return calculateSymbolForce(levels, GRAND_SACRED_BASE_FORCE, GRAND_SACRED_LEVEL_MULTIPLIER);
}

export function calculateGrandSacredStat(levels, jobName) {
    // Grand Sacred Symbols don't provide any stats
    return 0;
}

export function calculateGrandSacredExpBonus(levels) {
    if (!levels) return '';

    // Check if any symbols are above level 0
    const hasSymbols = levels.some(lvl => lvl > 0);
    if (!hasSymbols) return '';

    // Calculate total EXP bonus from all symbols
    return levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        // For level 1, we start with base EXP (10%)
        // For each level above 1, we add the per level increment (4%)
        return sum + GRAND_SACRED_BASE_EXP + GRAND_SACRED_EXP_PER_LEVEL * (lvl - 1);
    }, 0);
}

export function calculateGrandSacredMesoBonus(levels) {
    if (!levels) return '';

    // Check if any symbols are above level 0
    const hasSymbols = levels.some(lvl => lvl > 0);
    if (!hasSymbols) return '';

    // Calculate total Meso bonus from all symbols
    return levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        // For level 1, we start with base Meso (5%)
        // For each level above 1, we add the per level increment (1%)
        return sum + GRAND_SACRED_BASE_MESO + GRAND_SACRED_MESO_PER_LEVEL * (lvl - 1);
    }, 0);
}

export function calculateGrandSacredDropBonus(levels) {
    if (!levels) return '';

    // Check if any symbols are above level 0
    const hasSymbols = levels.some(lvl => lvl > 0);
    if (!hasSymbols) return '';

    // Calculate total Drop Rate bonus from all symbols
    return levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        // For level 1, we start with base Drop Rate (5%)
        // For each level above 1, we add the per level increment (1%)
        return sum + GRAND_SACRED_BASE_DROP + GRAND_SACRED_DROP_PER_LEVEL * (lvl - 1);
    }, 0);
}

// Grand Sacred page initialization
if (document.getElementById('grandSacredTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderSymbolsDetail('grandsacred');
    });
}
