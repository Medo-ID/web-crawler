import fs from "node:fs";
import path from "node:path";
function csvEscape(field) {
    const str = field ?? "";
    const needsQuoting = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuoting ? `"${escaped}"` : escaped;
}
export function writeCSVReport(pageData, filename = "report.csv") {
    if (!pageData || Object.keys(pageData).length === 0) {
        console.log("No data to write to CSV");
        return;
    }
    const headers = [
        "page_url",
        "h1",
        "first_paragraph",
        "outgoing_link_urls",
        "image_urls",
    ];
    const rows = [];
    rows.push(headers.join(","));
    const keys = Object.keys(pageData).sort();
    let skipped = 0;
    for (const key of keys) {
        const raw = pageData[key];
        if (!raw || typeof raw !== "object") {
            skipped++;
            continue;
        }
        const url = typeof raw.url === "string" ? raw.url : key;
        const h1 = typeof raw.h1 === "string" ? raw.h1 : "";
        const first = typeof raw.firstParagraph === "string" ? raw.firstParagraph : "";
        const outgoing = Array.isArray(raw.outgoingLinks)
            ? raw.outgoingLinks
            : [];
        const images = Array.isArray(raw.imageURLs)
            ? raw.imageURLs
            : [];
        const values = [url, h1, first, outgoing.join(";"), images.join(";")].map(csvEscape);
        rows.push(values.join(","));
    }
    const filePath = path.resolve(process.cwd(), filename);
    fs.writeFileSync(filePath, rows.join("\n"), { encoding: "utf-8" });
    if (skipped > 0) {
        console.log(`Report written to ${filePath} (skipped ${skipped} malformed row${skipped === 1 ? "" : "s"})`);
    }
    else {
        console.log(`Report written to ${filePath}`);
    }
}
//# sourceMappingURL=report.js.map