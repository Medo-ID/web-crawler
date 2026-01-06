import { JSDOM } from "jsdom";
import { ConcurrentCrawler } from "./ConcurrentCrawler.js";
export function normalizeURL(url) {
    const urlObj = new URL(url);
    let fullPath = `${urlObj.host}${urlObj.pathname}`;
    if (fullPath.slice(-1) === "/") {
        fullPath = fullPath.slice(0, -1);
    }
    return fullPath;
}
export function getH1FromHTML(html) {
    try {
        const doc = new JSDOM(html).window.document;
        const h1 = doc.querySelector("h1");
        return (h1?.textContent ?? "").trim();
    }
    catch {
        return "";
    }
}
export function getFirstParagraphFromHTML(html) {
    try {
        const doc = new JSDOM(html).window.document;
        const main = doc.querySelector("main");
        const p = main?.querySelector("p") ?? doc.querySelector("p");
        return (p?.textContent ?? "").trim();
    }
    catch {
        return "";
    }
}
export function getURLsFromHTML(html, baseURL) {
    const urls = [];
    try {
        const doc = new JSDOM(html).window.document;
        const anchors = doc.querySelectorAll("a");
        anchors.forEach((anchor) => {
            const href = anchor.getAttribute("href");
            if (!href)
                return;
            try {
                const absoluteURL = new URL(href, baseURL).toString();
                urls.push(absoluteURL);
            }
            catch (err) {
                console.error(`invalid href '${href}':`, err);
            }
        });
    }
    catch (err) {
        console.error("failed to parse HTML:", err);
    }
    return urls;
}
export function getImagesFromHTML(html, baseURL) {
    const imageURLs = [];
    try {
        const doc = new JSDOM(html).window.document;
        const images = doc.querySelectorAll("img");
        images.forEach((img) => {
            const src = img.getAttribute("src");
            if (!src)
                return;
            try {
                const absoluteURL = new URL(src, baseURL).toString();
                imageURLs.push(absoluteURL);
            }
            catch (err) {
                console.error(`invalid src '${src}':`, err);
            }
        });
    }
    catch (err) {
        console.error("failed to parse HTML:", err);
    }
    return imageURLs;
}
export function extractPageData(html, pageURL) {
    return {
        url: pageURL,
        h1: getH1FromHTML(html),
        firstParagraph: getFirstParagraphFromHTML(html),
        outgoingLinks: getURLsFromHTML(html, pageURL),
        imageURLs: getImagesFromHTML(html, pageURL),
    };
}
export async function crawlSiteAsync(baseURL, maxConcurrency = 5, maxPages = 100) {
    const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
    return await crawler.crawl();
}
//# sourceMappingURL=crawl.js.map