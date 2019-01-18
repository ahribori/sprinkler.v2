import { run } from '../selenium';
import jsdom from 'jsdom';
import { downloadImage } from '../modules/Image/image';

const { JSDOM } = jsdom;

const tagName = '젤네일';
const linkSelector = 'article > div > div > div > div > div > a';
const imageSelector = 'article > div > div > div > div > div > a > div > div > img';

const r = () => {
    run(async browser => {
        await browser.url(`https://www.instagram.com/explore/tags/${encodeURIComponent(tagName)}/`).waitForExist(linkSelector, 10000);
        const html = await browser.getHTML('#react-root main > article');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const linkElements = document.querySelectorAll(linkSelector);
        const imageElements = document.querySelectorAll(imageSelector);

        linkElements.forEach(linkElement => {
            const href = 'https://www.instagram.com' + linkElement.getAttribute('href');
            console.log(href);
        });

        imageElements.forEach((imageElement, index) => {
            const src = imageElement.getAttribute('src');
            downloadImage(src, `instagram_${Date.now()}_${index}`);
        });
        console.log(linkElements.length);

    });
};

// r();
