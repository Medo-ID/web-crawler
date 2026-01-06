# Web Crawler CLI

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js v24](https://img.shields.io/badge/Node.js-v24-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![npm version](https://img.shields.io/badge/npm-1.0.2-red)](https://www.npmjs.com/package/m-web-crawler)

A powerful command-line tool for crawling websites and generating CSV reports. This executable CLI tool efficiently crawls a website starting from a given URL, respecting concurrency limits and page limits.

## Why Use Web Crawler?

Whether you're optimizing for SEO, auditing site structure, or extracting content data, this tool helps you quickly analyze your entire website. Get a complete inventory of all pages, headings, links, and images in a single command—perfect for site audits, broken link detection, and content analysis without writing code.

## Features

- **Concurrent Crawling** - Efficiently crawl multiple pages in parallel with configurable concurrency limits
- **CSV Export** - Generate detailed CSV reports of all crawled pages
- **URL Filtering** - Only crawl pages within the same domain as the base URL
- **Customizable Limits** - Control maximum concurrent requests and total pages to crawl
- **Robust Parsing** - Uses JSDOM for accurate HTML parsing and link extraction

## Installation

### Global Installation

Install the package globally to use the `mcrawler` command anywhere:

```bash
npm install -g web-crawler
```

### Local Installation

Or install locally in your project:

```bash
npm install web-crawler
```

## Usage

### Basic Usage

```bash
mcrawler <url>
```

### Advanced Usage

```bash
mcrawler <url> [maxConcurrency] [maxPages]
```

### Arguments

- **`<url>`** - The base URL to start crawling from (required)
  - Example: `https://example.com`
- **`[maxConcurrency]`** - Maximum number of concurrent requests (default: `5`)
  - Must be a positive integer
- **`[maxPages]`** - Maximum number of pages to crawl (default: `100`)
  - Must be a positive integer
  - When reached, all remaining operations will be aborted

### Options

- **`--help, -h`** - Display help message with usage examples
- **`--version, -v`** - Display version information

## Examples

```bash
# Crawl a website with default settings (5 concurrent, 100 max pages)
mcrawler https://example.com

# Crawl with custom concurrency (3 concurrent requests)
mcrawler https://example.com 3

# Crawl with custom concurrency and page limit
mcrawler https://example.com 3 50

# Show help
mcrawler --help

# Show version
mcrawler --version
```

## Output

The crawler generates a `report.csv` file containing details about all crawled pages:

- **URL** - The page URL
- **Status** - HTTP status code or error information
- **Title** - Page title
- **Links Count** - Number of links found on the page

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Local Testing

```bash
npm start https://example.com
```

## Requirements

- Node.js v24
- TypeScript v5.9

## Dependencies

- **jsdom** - For DOM parsing and HTML manipulation
- **p-limit** - For controlling concurrent operations

## Troubleshooting

### Command not found: `mcrawler`

**Problem:** After installation, the `mcrawler` command is not recognized.

**Solutions:**

- If installed globally, make sure npm's global bin directory is in your PATH
- Reinstall the package: `npm install -g web-crawler`
- On macOS/Linux, verify npm global directory: `npm config get prefix`
- Verify the package was installed: `npm list -g web-crawler`

### SSL/Certificate errors

**Problem:** Getting SSL certificate validation errors when crawling HTTPS sites.

**Solutions:**

- Update Node.js to the latest version: `node --version`
- Temporarily disable SSL verification (for testing only): `NODE_TLS_REJECT_UNAUTHORIZED=0 mcrawler <url>`
- Check your internet connection and firewall settings

### Out of memory errors

**Problem:** Crawling large sites causes memory issues.

**Solutions:**

- Reduce `maxConcurrency` value (lower concurrent requests)
- Reduce `maxPages` value (crawl fewer pages)
- Increase Node.js heap size: `node --max-old-space-size=4096 src/index.ts <url>`

### Report.csv not generated

**Problem:** The crawler runs but no CSV file is created.

**Solutions:**

- Check write permissions in the current directory
- Ensure the crawler successfully crawled at least one page (check console output)
- Verify the destination path is correct

### Slow crawling performance

**Problem:** Crawling is taking too long.

**Solutions:**

- Increase `maxConcurrency` for more parallel requests (default: 5)
- Example: `mcrawler https://example.com 10 50`
- Note: Higher concurrency may impact the target server and your bandwidth

## License

ISC

## Author

Mohamed Idaghdour
