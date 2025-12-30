import pLimit from "p-limit";
import {
  extractPageData,
  normalizeURL,
  type ExtractedPageData,
} from "./crawl.ts";

export class ConcurrentCrawler {
  private baseURL: string;
  private pages: Record<string, ExtractedPageData>;
  private limit: <T>(fn: () => Promise<T>) => Promise<T>;

  private maxPages: number;
  private shouldStop = false;
  private allTasks = new Set<Promise<void>>();
  private abortController = new AbortController();

  private visited = new Set<string>();

  constructor(
    baseURL: string,
    maxConcurrency: number = 5,
    maxPages: number = 100
  ) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);
    this.maxPages = Math.max(1, maxPages);
  }

  private addPageVisit(normalizedURL: string): boolean {
    if (this.shouldStop) return false;
    if (this.visited.has(normalizedURL)) return false;

    if (this.visited.size >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      this.abortController.abort();
      return false;
    }

    this.visited.add(normalizedURL);
    return true;
  }

  private async getHTML(currentURL: string): Promise<string> {
    const { signal } = this.abortController;
    return await this.limit(async () => {
      const res = await fetch(currentURL, {
        headers: { "User-Agent": "BootCrawler/1.0" },
        signal,
      });
      if (res.status > 399) {
        throw new Error(`Got HTTP error: ${res.status} ${res.statusText}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        throw new Error(`Got non-HTML response: ${contentType}`);
      }
      return res.text();
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {
    if (this.shouldStop) return;

    const currentURLObj = new URL(currentURL);
    const baseURLObj = new URL(this.baseURL);
    if (currentURLObj.hostname !== baseURLObj.hostname) {
      return;
    }

    const normalizedURL = normalizeURL(currentURL);

    if (!this.addPageVisit(normalizedURL)) {
      return;
    }

    console.log(`crawling ${currentURL}`);

    let html = "";
    try {
      html = await this.getHTML(currentURL);
    } catch (err) {
      console.log(`${(err as Error).message}`);
      return;
    }

    if (this.shouldStop) return;

    const data = extractPageData(html, currentURL);
    this.pages[normalizedURL] = data;

    const crawlPromises: Promise<void>[] = [];
    for (const nextURL of data.outgoingLinks) {
      if (this.shouldStop) break;

      const task = this.crawlPage(nextURL);
      this.allTasks.add(task);
      task.finally(() => this.allTasks.delete(task));
      crawlPromises.push(task);
    }

    await Promise.all(crawlPromises);
  }

  async crawl(): Promise<Record<string, ExtractedPageData>> {
    const rootTask = this.crawlPage(this.baseURL);
    this.allTasks.add(rootTask);
    try {
      await rootTask;
    } finally {
      this.allTasks.delete(rootTask);
    }
    await Promise.allSettled(Array.from(this.allTasks));
    return this.pages;
  }
}
