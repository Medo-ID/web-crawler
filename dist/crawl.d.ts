export type ExtractedPageData = {
    url: string;
    h1: string;
    firstParagraph: string;
    outgoingLinks: string[];
    imageURLs: string[];
};
export declare function normalizeURL(url: string): string;
export declare function getH1FromHTML(html: string): string;
export declare function getFirstParagraphFromHTML(html: string): string;
export declare function getURLsFromHTML(html: string, baseURL: string): string[];
export declare function getImagesFromHTML(html: string, baseURL: string): string[];
export declare function extractPageData(html: string, pageURL: string): ExtractedPageData;
export declare function crawlSiteAsync(baseURL: string, maxConcurrency?: number, maxPages?: number): Promise<Record<string, ExtractedPageData>>;
//# sourceMappingURL=crawl.d.ts.map