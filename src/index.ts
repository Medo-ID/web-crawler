import { crawlSiteAsync } from "./crawl.ts";
import { writeCSVReport } from "./report.ts";

async function main() {
  const [, , baseURL, cArg, pArg] = process.argv;

  if (!baseURL) {
    console.error("Usage: npm start <url> [concurrency] [maxPages]");
    process.exit(1);
  }

  const concurrency = Number(cArg ?? 5);
  const maxPages = Number(pArg ?? 100);

  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error("Concurrency must be a positive integer");
  }

  if (!Number.isInteger(maxPages) || maxPages < 1) {
    throw new Error("maxPages must be a positive integer");
  }

  console.log(
    `Crawling ${baseURL} (concurrency=${concurrency}, maxPages=${maxPages})`
  );

  const pages = await crawlSiteAsync(baseURL, concurrency, maxPages);
  writeCSVReport(pages);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
