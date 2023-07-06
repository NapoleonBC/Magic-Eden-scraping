const cheerio = require('cheerio');
// const pretty = require('pretty');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const port = 3000;

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

        // const btc_collections = [];
        // Use .each method to loop through the table we selected
        // listItems.each((idx, el) => {
        //     btc_collections.push(collection);
        // });
        // Logs btc_collections array to the console
        // console.dir(btc_collections);
        // Write btc_collections array in btc_collections.json file
        /*fs.writeFile("coutries.json", JSON.stringify(btc_collections, null, 2), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Successfully written data to file");
        });*/
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

app.listen(port)