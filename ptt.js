const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const prePageSelector = '.btn-group-paging a:nth-child(2)@href';
    const listSelector = '.r-ent';
    const titleSelector = '.title a';
    const titleLinkSelector = '.title a@href';
    const authorSelector = '.meta .author';
    const dateSelector = '.meta .date';
    const pushContentSelector = '.nrec';
    const run = async (boardName = 'Gossiping') => {
        const endPoint = `https://www.ptt.cc/bbs/${boardName}/index.html`;
        const over18btnSelector = 'div.over18-button-container button';
        await page.goto(endPoint);
        const over18btn = await page.$(over18btnSelector);
        if (over18btn) {
            await over18btn.click();
        }
        const lists = await page.evaluate(
            (list, title) =>
                [...document.querySelectorAll(`${list} ${title}`)].map(t => ({
                    title: t.innerText,
                    href: t.href
                })),
            listSelector,
            titleSelector
        );
        for (const list of lists) {
            console.log(list.href);
            const newPage = await browser.newPage();
            await newPage.goto(list.href);
            const content = await newPage.evaluate(() => document.querySelector('div#main-content').innerText);
            console.log(content);
            // console.log(await newPage.content());
        }
    };

    await run('Gamesale');
    browser.close();
})();
