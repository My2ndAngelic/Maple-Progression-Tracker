// Initialize pages when loaded
export function initializeCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().split('.')[0];
    
    if (page === 'overview' || path.endsWith('/')) {
        import('./script.js').then(module => module.renderTable());
    } else if (page === 'progression') {
        import('./progression.js').then(module => module.renderProgressionTable());
    } else if (page === 'equipment') {
        import('./equipment.js').then(module => module.renderEquipmentTable());
    } else if (page === 'cash') {
        import('./cash.js').then(module => module.renderCashTable());
    } else if (page === 'arcane') {
        import('./symbolUtils.js').then(module => module.renderSymbolsDetail('arcane'));
    } else if (page === 'sacred') {
        import('./symbolUtils.js').then(module => module.renderSymbolsDetail('sacred'));
    }
}
