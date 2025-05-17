import {loadCSV} from './utils.js';
import {calculateForce, renderSymbolDetail} from './symbolUtils.js';

const SACRED_BASE_FORCE = 10;
const SACRED_LEVEL_MULTIPLIER = 10;

export function calculateSacredForce(levels) {
    return calculateForce(levels, SACRED_BASE_FORCE, SACRED_LEVEL_MULTIPLIER);
}

export async function renderSacredDetail() {
    const [sacredData, accountData] = await Promise.all([
        loadCSV('sacred.csv'),
        loadCSV('account.csv')
    ]);

    await renderSymbolDetail(
        sacredData,
        accountData,
        'sacredTable',
        'Error loading sacred details:'
    );
}