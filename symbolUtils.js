export function createSymbolsMap(data) {
    const map = {};
    data.forEach(row => {
        const {IGN, ...symbols} = row;
        map[IGN] = Object.values(symbols).map(v => Number(v) || 0);
    });
    return map;
}

export function calculateSymbolForce(levels, baseForce, levelMultiplier) {
    if (!levels) return '';
    return levels.reduce((sum, lvl) => {
        if (lvl === 0) return sum;
        return sum + baseForce + levelMultiplier * (lvl - 1);
    }, 0);
}

export async function renderSymbolDetail(symbolData, accountData, tableId, errorMessage) {
    try {
        const levelMap = new Map(accountData.map(char => [char.ign, char.level]));
        const columns = Object.keys(symbolData[0] || {}).filter(k => k !== 'IGN');

        const thead = document.querySelector(`#${tableId} thead`);
        const tbody = document.querySelector(`#${tableId} tbody`);
        thead.innerHTML = '';
        tbody.innerHTML = '';

        const trHead = document.createElement('tr');
        trHead.appendChild(Object.assign(document.createElement('th'), {textContent: 'IGN'}));
        trHead.appendChild(Object.assign(document.createElement('th'), {textContent: 'Level'}));
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        symbolData.forEach(row => {
            const tr = document.createElement('tr');

            // Add IGN
            const ignTd = document.createElement('td');
            ignTd.textContent = row.IGN;
            tr.appendChild(ignTd);

            // Add Level
            const levelTd = document.createElement('td');
            levelTd.textContent = levelMap.get(row.IGN) || '';
            tr.appendChild(levelTd);

            // Add symbol levels
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] || '';
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(errorMessage, err);
    }
}