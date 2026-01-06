import { type ExtractedPageData } from "./crawl.ts";
export declare class ConcurrentCrawler {
    private baseURL;
    private pages;
    private limit;
    private maxPages;
    private shouldStop;
    private allTasks;
    private abortController;
    private visited;
    constructor(baseURL: string, maxConcurrency?: number, maxPages?: number);
    crawl(): Promise<Record<string, ExtractedPageData>>;
    private crawlPage;
    private addPageVisit;
    private getHTML;
}
//# sourceMappingURL=ConcurrentCrawler.d.ts.map