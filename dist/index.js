#!/usr/bin/env node
import { crawlSiteAsync } from "./crawl.js";
import { writeCSVReport } from "./report.js";
async function main() {
    const [, , baseURL, cArg, pArg] = process.argv;
    // Handle help flag
    if (baseURL === "--help" || baseURL === "-h") {
        showHelp();
        process.exit(0);
    }
    // Handle version flag
    if (baseURL === "--version" || baseURL === "-v") {
        showVersion();
        process.exit(0);
    }
    if (!baseURL) {
        console.error(`
      Usage: npm start <url> [maxConcurrency] [maxPages]

      @maxConcurrency: If max pages reached, all remaining operations will be aborted.
      @maxPages: Maximum number of successfully crawled pages.
    `);
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
    console.log(`Crawling ${baseURL} (maxConcurrency=${maxConcurrency}, maxPages=${maxPages})`);
    const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);
    // console.log(pages);
    writeCSVReport(pages, "report.csv");
    process.exit(0);
}
function showHelp() {
    console.log(`
    Usage: medcrawl <url> [maxConcurrency] [maxPages]

    Description:
      Web crawler CLI tool that crawls a website and generates a CSV report.

    Arguments:
      <url>              The base URL to start crawling from
      [maxConcurrency]   Maximum number of concurrent requests (default: 5)
      [maxPages]         Maximum number of pages to crawl (default: 100)
      
      - Note: If max pages reached, all remaining operations will be aborted.
    
      Options:
      --help, -h         Show this help message
      --version, -v      Show version information

    Examples:
      medcrawl https://example.com
      medcrawl https://example.com 3 50
      medcrawl --help
      medcrawl --version
  `);
}
function showVersion() {
    const version = "1.0.0";
    console.log(`web-crawler version ${version}`);
}
main();
//# sourceMappingURL=index.js.map