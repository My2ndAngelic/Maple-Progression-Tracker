// utils.js
export function parseCSV(text) {
    const rows = [];
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const headers = [];
    let isHeaderParsed = false;

    for (const line of lines) {
        const row = [];
        let cur = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"' && (i === 0 || line[i - 1] !== "\\")) {
                inQuotes = !inQuotes;
            } else if (c === "," && !inQuotes) {
                row.push(cur.trim());
                cur = "";
            } else {
                cur += c;
            }
        }
        row.push(cur.trim());

        if (!isHeaderParsed) {
            row.forEach((h) => headers.push(h));
            isHeaderParsed = true;
        } else {
            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = row[idx] || "";
            });
            rows.push(obj);
        }
    }
    return rows;
}

export async function loadCSV(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const text = await res.text();
    return parseCSV(text);
}
