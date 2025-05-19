// This file is for backward compatibility, redirecting to armor.js
import {renderArmorTable} from './armor.js';

// Export the renamed function for backward compatibility
export const renderEquipmentTable = renderArmorTable;

// Equipment page initialization - redirects to armor functionality
if (document.getElementById('equipmentTable')) {
    import('./ui.js').then(({initializeUI}) => {
        initializeUI();
        renderEquipmentTable();
    });
}
