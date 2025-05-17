import {loadCSV} from './utils.js';
import {calculateForce, renderSymbolDetail} from './symbolUtils.js';

const ARCANE_BASE_FORCE = 30;
const ARCANE_LEVEL_MULTIPLIER = 10;

export function calculateArcaneForce(levels) {
    return calculateForce(levels, ARCANE_BASE_FORCE, ARCANE_LEVEL_MULTIPLIER);
}

export async function renderArcaneDetail() {
    const [arcaneData, accountData] = await Promise.all([
        loadCSV('arcane.csv'),
        loadCSV('account.csv')
    ]);
    await renderSymbolDetail(
        arcaneData,
        accountData,
        'arcaneTable',
        'Error loading arcane details:'
    );
}