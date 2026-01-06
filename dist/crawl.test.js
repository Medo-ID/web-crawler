import { describe, test, expect } from "vitest";
import { normalizeURL, getH1FromHTML, getFirstParagraphFromHTML, getURLsFromHTML, getImagesFromHTML, extractPageData, } from "./crawl.js";
describe("normalizeURL", () => {
    test("protocol", () => {
        const input = "https://blog.boot.dev/path";
        const actual = normalizeURL(input);
        const expected = "blog.boot.dev/path";
        expect(actual).toEqual(expected);
    });
    test("slash", () => {
        const input = "https://blog.boot.dev/path/";
        const actual = normalizeURL(input);
        const expected = "blog.boot.dev/path";
        expect(actual).toEqual(expected);
    });
    test("capitals", () => {
        const input = "https://BLOG.boot.dev/path";
        const actual = normalizeURL(input);
        const expected = "blog.boot.dev/path";
        expect(actual).toEqual(expected);
    });
    test("http", () => {
        const input = "http://BLOG.boot.dev/path";
        const actual = normalizeURL(input);
        const expected = "blog.boot.dev/path";
        expect(actual).toEqual(expected);
    });
});
describe("getH1FromHTML", () => {
    test("basic html", () => {
        const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
        const actual = getH1FromHTML(inputBody);
        const expected = "Test Title";
        expect(actual).toEqual(expected);
    });
    test("no h1", () => {
        const inputBody = `<html><body><p>No H1 here</p></body></html>`;
        const actual = getH1FromHTML(inputBody);
        const expected = "";
        expect(actual).toEqual(expected);
    });
});
describe("getFirstParagraphFromHTML", () => {
    test("main priority", () => {
        const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>`;
        const actual = getFirstParagraphFromHTML(inputBody);
        const expected = "Main paragraph.";
        expect(actual).toEqual(expected);
    });
    test("fallback to first p", () => {
        const inputBody = `
    <html><body>
      <p>First outside paragraph.</p>
      <p>Second outside paragraph.</p>
    </body></html>`;
        const actual = getFirstParagraphFromHTML(inputBody);
        const expected = "First outside paragraph.";
        expect(actual).toEqual(expected);
    });
    test("no paragraphs", () => {
        const inputBody = `<html><body><h1>Title</h1></body></html>`;
        const actual = getFirstParagraphFromHTML(inputBody);
        const expected = "";
        expect(actual).toEqual(expected);
    });
});
describe("getURLsFromHTML", () => {
    test("absolute", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `<html><body><a href="https://blog.boot.dev"><span>Boot.dev</span></a></body></html>`;
        const actual = getURLsFromHTML(inputBody, inputURL);
        const expected = ["https://blog.boot.dev/"];
        expect(actual).toEqual(expected);
    });
    test("relative", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;
        const actual = getURLsFromHTML(inputBody, inputURL);
        const expected = ["https://blog.boot.dev/path/one"];
        expect(actual).toEqual(expected);
    });
    test("both absolute and relative", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `<html><body>` +
            `<a href="/path/one"><span>Boot.dev</span></a>` +
            `<a href="https://other.com/path/one"><span>Boot.dev</span></a>` +
            `</body></html>`;
        const actual = getURLsFromHTML(inputBody, inputURL);
        const expected = [
            "https://blog.boot.dev/path/one",
            "https://other.com/path/one",
        ];
        expect(actual).toEqual(expected);
    });
});
describe("getImagesFromHTML", () => {
    test("absolute", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `
    <html><body>
      <img src="https://blog.boot1.dev/logo.png" alt="Logo">
    </body></html>`;
        const actual = getImagesFromHTML(inputBody, inputURL);
        const expected = ["https://blog.boot1.dev/logo.png"];
        expect(actual).toEqual(expected);
    });
    test("relative", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;
        const actual = getImagesFromHTML(inputBody, inputURL);
        const expected = ["https://blog.boot.dev/logo.png"];
        expect(actual).toEqual(expected);
    });
    test("all img tags", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `
    <html><body>
      <img src="/logo.png" alt="Logo">
      <img src="https://cdn.boot.dev/banner.jpg">
    </body></html>`;
        const actual = getImagesFromHTML(inputBody, inputURL);
        const expected = [
            "https://blog.boot.dev/logo.png",
            "https://cdn.boot.dev/banner.jpg",
        ];
        expect(actual).toEqual(expected);
    });
    test("href attribute missing", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `
    <html><body>
      <img alt="Logo1">
      <img src="/logo2.png" alt="Logo2">
    </body></html>`;
        const actual = getImagesFromHTML(inputBody, inputURL);
        const expected = ["https://blog.boot.dev/logo2.png"];
        expect(actual).toEqual(expected);
    });
});
describe("extractPageData", () => {
    test("extract_page_data basic", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `
    <html><body>
      <h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;
        const actual = extractPageData(inputBody, inputURL);
        const expected = {
            url: "https://blog.boot.dev",
            h1: "Test Title",
            firstParagraph: "This is the first paragraph.",
            outgoingLinks: ["https://blog.boot.dev/link1"],
            imageURLs: ["https://blog.boot.dev/image1.jpg"],
        };
        expect(actual).toEqual(expected);
    });
    test("extract_page_data main section priority", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `
    <html><body>
      <nav><p>Navigation paragraph</p></nav>
      <main>
        <h1>Main Title</h1>
        <p>Main paragraph content.</p>
      </main>
    </body></html>
  `;
        const actual = extractPageData(inputBody, inputURL);
        expect(actual.h1).toEqual("Main Title");
        expect(actual.firstParagraph).toEqual("Main paragraph content.");
    });
    test("extract_page_data missing elements", () => {
        const inputURL = "https://blog.boot.dev";
        const inputBody = `<html><body><div>No h1, p, links, or images</div></body></html>`;
        const actual = extractPageData(inputBody, inputURL);
        const expected = {
            url: "https://blog.boot.dev",
            h1: "",
            firstParagraph: "",
            outgoingLinks: [],
            imageURLs: [],
        };
        expect(actual).toEqual(expected);
    });
});
//# sourceMappingURL=crawl.test.js.map