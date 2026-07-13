import {createDataMap, loadCSV} from "./csvHandling.js";
import {createTableCell, prepareTable, sortAccountsByLevel} from "./tableUtils.js";

const JOB_COUNT = 4;
const BOOST_COUNT = 6;
const COMMON_COUNT = 21;
const NON_XENON_COMMON_LIMIT = 19;
const JOB_COMPLETE_VALUE = 30;
const BOOST_COMPLETE_VALUE = 60;
const COMMON_COMPLETE_VALUE = 30;

function createGroupedHeader() {
    const table = document.getElementById("vMatrixTable");
    const thead = table.querySelector("thead");

    const jobSubHeaders = Array.from({length: JOB_COUNT}, (_, i) => `<th class="node-sub-header">${i + 1}</th>`).join("");
    const boostSubHeaders = Array.from({length: BOOST_COUNT}, (_, i) => `<th class="node-sub-header">${i + 1}</th>`).join("");
    const commonSubHeaders = Array.from({length: COMMON_COUNT}, (_, i) => `<th class="node-sub-header">${i + 1}</th>`).join("");

    thead.innerHTML = `
      <tr>
        <th rowspan="2">Character</th>
        <th rowspan="2">Level</th>
        <th class="job-header" colspan="${JOB_COUNT}">Job</th>
        <th class="boost-header" colspan="${BOOST_COUNT}">Boost</th>
        <th class="common-header" colspan="${COMMON_COUNT}">Common</th>
      </tr>
      <tr>
        ${jobSubHeaders}
        ${boostSubHeaders}
        ${commonSubHeaders}
      </tr>
    `;
}

function normalizeNodeValue(value) {
    if (value === undefined || value === null || value === "") return "";
    return value;
}

function isCompletedValue(value, completeValue) {
    return Number(value) === completeValue;
}

function createVRow(char, vRow) {
    const tr = document.createElement("tr");
    const isXenon = (char.jobName || "").toLowerCase() === "xenon";

    tr.appendChild(createTableCell(char.IGN || ""));
    tr.appendChild(createTableCell(char.level || ""));

    for (let i = 1; i <= JOB_COUNT; i++) {
        const value = normalizeNodeValue(vRow[`J${i}`]);
        const cell = createTableCell(value, "node-cell");
        if (isCompletedValue(value, JOB_COMPLETE_VALUE)) {
            cell.classList.add("node-complete");
        }
        tr.appendChild(cell);
    }

    for (let i = 1; i <= BOOST_COUNT; i++) {
        const value = normalizeNodeValue(vRow[`B${i}`]);
        const cell = createTableCell(value, "node-cell");
        if (isCompletedValue(value, BOOST_COMPLETE_VALUE)) {
            cell.classList.add("node-complete");
        }
        tr.appendChild(cell);
    }

    for (let i = 1; i <= COMMON_COUNT; i++) {
        const isXenonOnlySlot = i > NON_XENON_COMMON_LIMIT;
        const rawValue = normalizeNodeValue(vRow[`C${i}`]);
        const value = isXenonOnlySlot && !isXenon ? "" : rawValue;
        const commonCell = createTableCell(value, "node-cell");

        if (isCompletedValue(value, COMMON_COMPLETE_VALUE)) {
            commonCell.classList.add("node-complete");
        }

        if (isXenonOnlySlot && !isXenon) {
            commonCell.classList.add("xenon-only-masked");
        }

        tr.appendChild(commonCell);
    }

    return tr;
}

export async function renderVMatrixTable() {
    try {
        const [accountData, skill5Data] = await Promise.all([
            loadCSV("data/account.csv"),
            loadCSV("data/skill_5.csv")
        ]);

        sortAccountsByLevel(accountData);
        const vMap = createDataMap(skill5Data, "IGN");

        createGroupedHeader();
        const tbody = prepareTable("vMatrixTable");
        if (!tbody) return;

        accountData.forEach(char => {
            const vRow = vMap[char.IGN] || {};
            const row = createVRow(char, vRow);
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Error rendering V Matrix table:", err);
    }
}

if (document.getElementById("vMatrixTable")) {
    import("./ui.js").then(({initializeUI}) => {
        initializeUI();
        renderVMatrixTable();
    });
}
