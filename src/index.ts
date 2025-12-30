import { crawlSiteAsync } from "./crawl.ts";
import { writeCSVReport } from "./report.ts";

async function main() {
  const [, , baseURL, cArg, pArg] = process.argv;

  if (!baseURL) {
    console.error("Usage: npm start <url> [maxConcurrency] [maxPages]");
    process.exit(1);
  }

  const maxConcurrency = Number(cArg ?? 5);
  const maxPages = Number(pArg ?? 100);

  if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
    throw new Error("Max concurrency must be a positive integer");
  }

  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new Error("maxPages must be a positive integer");
  }

  console.log(
    `Crawling ${baseURL} (maxConcurrency=${maxConcurrency}, maxPages=${maxPages})`
  );

  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);
  writeCSVReport(pages, "report.csv");
  process.exit(0);
}

main();
