import {createDataMap, loadCSV} from "./csvHandling.js";
import {createTableCell, prepareTable, sortAccountsByLevel} from "./tableUtils.js";

const CATEGORY_ORDER = ["Skill", "Mastery", "Boost", "Common", "Other"];

function parseColumn(header) {
    const raw = (header || "").trim();
    const lower = raw.toLowerCase();

    const patterns = [
        {category: "Skill", pattern: /^skill[\s_\-:]+(.+)$/i},
        {category: "Mastery", pattern: /^mastery[\s_\-:]+(.+)$/i},
        {category: "Boost", pattern: /^boost[\s_\-:]+(.+)$/i},
        {category: "Common", pattern: /^common[\s_\-:]+(.+)$/i}
    ];

    for (const {category, pattern} of patterns) {
        const match = raw.match(pattern);
        if (match) {
            return {
                key: raw,
                category,
                subLabel: (match[1] || "").trim() || raw
            };
        }
    }

    // Allow shorthand like S_Origin / M_1 / B_1 / C_1 for future manual edits.
    const shorthand = [
        {category: "Skill", prefix: "s"},
        {category: "Mastery", prefix: "m"},
        {category: "Boost", prefix: "b"},
        {category: "Common", prefix: "c"}
    ];

    for (const {category, prefix} of shorthand) {
        if (lower.startsWith(`${prefix}_`) || lower.startsWith(`${prefix}-`)) {
            return {
                key: raw,
                category,
                subLabel: raw.slice(2).trim() || raw
            };
        }
    }

    return {
        key: raw,
        category: "Other",
        subLabel: raw
    };
}

function getHexaColumns(hexaRows) {
    const headers = hexaRows.length > 0 ? Object.keys(hexaRows[0]) : [];
    return headers
        .filter(header => header !== "IGN")
        .map((header, index) => ({...parseColumn(header), order: index}))
        .sort((a, b) => {
            const categoryDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
            if (categoryDiff !== 0) return categoryDiff;
            return a.order - b.order;
        });
}

function renderGroupedHeader(table, columns) {
    const thead = table.querySelector("thead");
    const groups = CATEGORY_ORDER
        .map(category => ({category, cols: columns.filter(col => col.category === category)}))
        .filter(group => group.cols.length > 0);

    const topHeaders = groups
        .map(group => `<th class="${group.category.toLowerCase()}-header" colspan="${group.cols.length}">${group.category}</th>`)
        .join("");

    const subHeaders = groups
        .flatMap(group => group.cols.map(col => `<th class="hexa-sub-header">${col.subLabel}</th>`))
        .join("");

    thead.innerHTML = `
      <tr>
        <th rowspan="2">Character</th>
        <th rowspan="2">Level</th>
        ${topHeaders}
      </tr>
      <tr>
        ${subHeaders}
      </tr>
    `;
}

function createHexaRow(char, hexaRow, columns) {
    const tr = document.createElement("tr");
    tr.appendChild(createTableCell(char.IGN || ""));
    tr.appendChild(createTableCell(char.level || ""));

    columns.forEach(col => {
        tr.appendChild(createTableCell(hexaRow[col.key] || "", "hexa-cell"));
    });

    return tr;
}

export async function renderHexaTable() {
    try {
        const [accountData, hexaData] = await Promise.all([
            loadCSV("data/account.csv"),
            loadCSV("data/skill_6.csv")
        ]);

        sortAccountsByLevel(accountData);
        const eligibleCharacters = accountData.filter(char => Number(char.level) >= 260);
        const hexaMap = createDataMap(hexaData, "IGN");
        const columns = getHexaColumns(hexaData);

        const table = document.getElementById("hexaTable");
        renderGroupedHeader(table, columns);

        const tbody = prepareTable("hexaTable");
        if (!tbody) return;

        eligibleCharacters.forEach(char => {
            const row = createHexaRow(char, hexaMap[char.IGN] || {}, columns);
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Error rendering Hexa table:", err);
    }
}

if (document.getElementById("hexaTable")) {
    import("./ui.js").then(({initializeUI}) => {
        initializeUI();
        renderHexaTable();
    });
}
