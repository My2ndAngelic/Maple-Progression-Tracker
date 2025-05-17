import {calculateSymbolForce} from './symbolUtils.js';

const SACRED_BASE_FORCE = 10;
const SACRED_LEVEL_MULTIPLIER = 10;

export function calculateSacredForce(levels) {
    return calculateSymbolForce(levels, SACRED_BASE_FORCE, SACRED_LEVEL_MULTIPLIER);
}
