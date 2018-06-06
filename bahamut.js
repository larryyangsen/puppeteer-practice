const puppeteer = require('puppeteer');
const fs = require('fs');
(async (category = 'PS4') => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const lastPaginationSelector = '.BH-pagebtnA a:last-child';
    const titleSelector = '.ACG-maintitle';
    const titles = [];
    try {
        await page.goto(`https://acg.gamer.com.tw/index.php?t=1&p=${category}`);
        const lastPageCount = await page.evaluate(sel => document.querySelector(sel).innerText, lastPaginationSelector);
        for (let i = 1; i <= lastPageCount; i++) {
            const endPoint = `https://acg.gamer.com.tw/index.php?t=1&p=${category}&page=${i}`;
            await page.goto(endPoint);
            titles.push(
                ...(await page.evaluate(
                    sel => [...document.querySelectorAll(sel)].map(e => e.innerText),
                    titleSelector
                ))
            );
        }
        fs.writeFileSync(`${category}.json`, JSON.stringify(titles, null, 4));
        browser.close();
    } catch (e) {
        console.error(e);
        browser.close();
    }
})(process.argv[2] || 'ps4');
