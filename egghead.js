const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
let browser, page;

const init = async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
};
const delay = (ms = 5000) => new Promise(resolve => setTimeout(() => resolve(), ms));
const start = async (url = '', isLogin = false) => {
    const fetchVideo = () => {
        return page.click('span.ml2');
    };
    const downloadSubtitle = async () => {
        const title = url.substring(url.lastIndexOf('/') + 1);
        const subtitleUrl = `https://egghead.io/api/v1/lessons/${title}/subtitles`;
        const newPage = await browser.newPage();
        await newPage.goto(subtitleUrl);
        const text = await newPage.evaluate(() => document.body.innerText);
        await writeFile(path.join('./', `${title}.srt`), text);
        return newPage.close();
    };
    const getNextUrl = async () => {
        try {
            await page.waitForSelector('li.nowPlaying+li a');
            return page.evaluate(() => {
                const next = document.querySelector('li.nowPlaying+li a');
                return next ? next.href : '';
            });
        } catch (e) {
            return Promise.resolve('');
        }
    };

    const login = async () => {
        const url = 'https://egghead.io/users/sign_in';
        await page.goto(url);
        await page.click('input.email');
        await page.keyboard.type('');
        await page.click('input.password');
        await page.keyboard.type('');
        await page.click('input.custom-btn');
        await page.waitForNavigation();
    };
    try {
        await page.setViewport({
            width: 1280,
            height: 1024
        });
        if (!isLogin) await login();
        await page.goto(url);
        await fetchVideo();
        await downloadSubtitle();
        const nextUrl = await getNextUrl();
        console.log(`nextUrl:${nextUrl}`);
        if (nextUrl != '') {
            // browser.close();
            await delay();
            return start(nextUrl, true);
        }
        await delay(30000);
        return browser.close();
    } catch (e) {
        console.error(e);
    }
};
(async () => {
    await init();
    start('https://egghead.io/lessons/react-error-handling-using-error-boundaries-in-react-16');
})();
