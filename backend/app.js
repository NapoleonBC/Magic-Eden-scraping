const cheerio = require('cheerio');
// const pretty = require('pretty');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const nodemon = require('nodemon');

const app = express();

let browser;
let page

app.use(express.json());

(async () => {
    // browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    browser = await puppeteer.launch({
        headless: 'new',
    });
    page = await browser.newPage();
})();

// await browser.close();
const port = 3000;


app.get('/latest-sales', async (req, res) => {
    url = 'https://api-mainnet.magiceden.io/v2/ord/btc/carousels/latest-sales'
    try {
        await page.goto(url);
        const data = await page.content();
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);

        return res.status(200).send({ success: true, msg: JSON.parse($.root().text())});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/highest-activity-collections', async (req, res) => {
    url = 'https://api-mainnet.magiceden.io/v2/ord/btc/carousels/highest-activity-collections'
    try {
        await page.goto(url);
        const data = await page.content();
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);

        return res.status(200).send({ success: true, msg: JSON.parse($.root().text())});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/popular-collections', async (req, res) => {
    const limit = parseInt(req.query.limit) || 1000;    // avoid bad request exception
    const window = req.query.window || '7d';
    const url = `https://api-mainnet.magiceden.io/v2/ord/btc/popular_collections?limit=${limit}&window=${window}`;
    try {
        console.log(url)
        console.log(limit)
        console.log(window)
        status_code = (await page.goto(url)).status();
        const data = await page.content();
        // Load HTML we fetched in the previous line    
        const $ = cheerio.load(data);

        return res.status(status_code).send( { success: status_code==200 , msg: JSON.parse($.root().text()) } );
    } catch (error) {
        console.error(error);
        return res.status(403).send('Access denied');
    }
});


app.post('/scraping', async (req, res) => {
    url = "https://magiceden.io/ordinals/marketplace/omb"
    if (!req.body.backend_url || !req.body.symbol) {
        return res.status(400).send({ success: false, msg: 'Invalid request' });
    }
    const backend_url = req.body.backend_url
    const symbol = req.body.symbol
    url = `${backend_url}/marketplace/${symbol}`
    console.log(url)

    try {
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);
        // Select the specific <script> tag by its id and type attributes
        const scriptTag = $('script#\\__NEXT_DATA__[type="application/json"]');
        console.log(scriptTag)
        // Extract the content of the script tag
        const scriptContent = scriptTag.html();
        const collection = JSON.parse(scriptContent);

        response = collection.props.pageProps
        // Accessing the values from the body
        const name = response.collection.name;
        const imageURI = response.collection.imageURI;
        const floorPrice = response.stats.find(stat => stat.trait_type === 'FLOOR').value;

        // Creating an object with the extracted values
        const extractedValues = {
            name: name,
            imageURI: imageURI,
            floorPrice: floorPrice
        };
        return res.status(200).send({ success: true, msg: extractedValues });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ success: false, msg: 'Invalid request' });
    }
})

app.listen(port, () => {
    console.log('Server is running on port 3000');
});