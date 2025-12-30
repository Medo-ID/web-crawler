import fs from "node:fs";
import path from "node:path";
import type { ExtractedPageData } from "./crawl.ts";

export function writeCSVReport(
  pageData: Record<string, ExtractedPageData>,
  filename = "report.csv"
): void {
  if (!Object.keys(pageData).length) {
    console.log("No data to write.");
    return;
  }

  const headers = [
    "page_url",
    "h1",
    "first_paragraph",
    "outgoing_link_urls",
    "image_urls",
  ];

  const rows = [headers.join(",")];

  const keys = Object.keys(pageData).sort();

  for (const key of keys) {
    const p = pageData[key]!;
    rows.push(
      [
        p.url,
        p.h1,
        p.firstParagraph,
        p.outgoingLinks.join(";"),
        p.imageURLs.join(";"),
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const filePath = path.resolve(process.cwd(), filename);
  fs.writeFileSync(filePath, rows.join("\n"), "utf-8");
  console.log(`Report written to ${filePath}`);
}

function csvEscape(value: string): string {
  const v = value ?? "";
  const escaped = v.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}
