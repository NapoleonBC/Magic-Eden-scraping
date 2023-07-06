const cheerio = require('cheerio');
const pretty = require('pretty');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const port = 5000;

app.post('/scraping', async (req, res) => {
    url = "https://magiceden.io/ordinals/marketplace/omb"
    if (!req.backend_url || !req.symbol) {
        return res.status(400).send({ success: false, msg: 'Invalid request' });
    }
    const backend_url = req.backend_url
    const symbol = req.symbol
    url = `${backend_url}/marketplace/${omb}`
    console.log(url)

    try {
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);
        // Select all the list items in plainlist class
        const listItems = $(".plainlist ul li");
        // Stores data for all countries
        const countries = [];
        // Use .each method to loop through the li we selected
        listItems.each((idx, el) => {
            // Object holding data for each country/jurisdiction
            const country = { name: "", iso3: "" };
            // Select the text content of a and span elements
            // Store the textcontent in the above object
            country.name = $(el).children("a").text();
            country.iso3 = $(el).children("span").text();
            // Populate countries array with country data
            countries.push(country);
        });
        // Logs countries array to the console
        console.dir(countries);
        // Write countries array in countries.json file
        fs.writeFile("coutries.json", JSON.stringify(countries, null, 2), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Successfully written data to file");
        });
    } catch (err) {
        console.error(err);
    }
})