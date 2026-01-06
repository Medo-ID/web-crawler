import pLimit from "p-limit";
import { extractPageData, normalizeURL, } from "./crawl.js";
export class ConcurrentCrawler {
    baseURL;
    pages;
    limit;
    maxPages;
    shouldStop = false;
    allTasks = new Set();
    abortController = new AbortController();
    visited = new Set();
    constructor(baseURL, maxConcurrency = 5, maxPages = 100) {
        this.baseURL = baseURL;
        this.pages = {};
        this.limit = pLimit(maxConcurrency);
        this.maxPages = Math.max(1, maxPages);
    }
    async crawl() {
        const rootTask = this.crawlPage(this.baseURL);
        this.allTasks.add(rootTask);
        try {
            await rootTask;
        }
        finally {
            this.allTasks.delete(rootTask);
        }
        await Promise.allSettled(Array.from(this.allTasks));
        return this.pages;
    }
    async crawlPage(currentURL) {
        if (this.shouldStop)
            return;
        const currentURLObj = new URL(currentURL);
        const baseURLObj = new URL(this.baseURL);
        if (currentURLObj.hostname !== baseURLObj.hostname)
            return;
        const normalizedURL = normalizeURL(currentURL);
        if (!this.addPageVisit(normalizedURL))
            return;
        console.log(`crawling ${currentURL}`);
        let html;
        try {
            html = await this.getHTML(currentURL);
        }
        catch (err) {
            console.error(`${err.message}`);
            return;
        }
        const data = extractPageData(html, currentURL);
        this.pages[normalizedURL] = data;
        if (Object.keys(this.pages).length >= this.maxPages) {
            this.shouldStop = true;
            this.abortController.abort();
            console.log("Reached maximum number of pages to crawl.");
            return;
        }
        for (const nextURL of data.outgoingLinks) {
            if (this.shouldStop)
                break;
            const task = this.limit(() => this.crawlPage(nextURL));
            this.allTasks.add(task);
            task.finally(() => this.allTasks.delete(task));
        }
    }
    addPageVisit(normalizedURL) {
        if (this.shouldStop)
            return false;
        if (this.visited.has(normalizedURL))
            return false;
        // if (this.visited.size >= this.maxPages) {
        //   this.shouldStop = true;
        //   this.abortController.abort();
        //   console.log("Reached maximum number of pages to crawl.");
        //   return false;
        // }
        this.visited.add(normalizedURL);
        return true;
    }
    async getHTML(currentURL) {
        const { signal } = this.abortController;
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
    }
}
//# sourceMappingURL=ConcurrentCrawler.js.map