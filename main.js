const Apify = require('apify');
const typeCheck = require('type-check').typeCheck;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const results = [];

// Definition of the input
const INPUT_TYPE = `{
    query: String,
    source: String,
    dictionary: String
}`;

const LEVEL_TYPE = {
    NOVOICE: 'NOVOICE',
    INTERMEDIATE: 'INTERMEDIATE',
    EXPERT: 'EXPERT'
}


Apify.main(async () => {
    // Get input of your act
    const input = await Apify.getValue('INPUT');

    // Fetch the input and check it has a valid format
    // You don't need to check the input, but it's a good practice.
    if (!typeCheck(INPUT_TYPE, input)) {
        console.log('Expected input:');
        console.log(INPUT_TYPE);
        console.log('Received input:');
        console.dir(input);
        throw new Error('Received invalid input');
    }

    console.log('My input:');
    console.dir(input);

    // Environment variables
    const launchPuppeteer = process.env.NODE_ENV === 'development' ? puppeteer.launch : Apify.launchPuppeteer;

    // Navigate to page
    const uri = `https://www.linguee.com/${input.dictionary}/search?source=${input.source}&query=${input.query}`;
    const browser = await launchPuppeteer();
    const page = await browser.newPage();
    await page.goto(uri)

    let html = await page.content()
    const $ = cheerio.load(html)

    // get meaning and examples
    $('.sortablemg.featured').each((i, element1) => {
        let result = {}
        result['meaning'] = $(element1).find('.dictLink.featured').text().trim();
        result['grammar'] = $(element1).find('.tag_type').text().trim();
        result.examples = [];

        $(element1).find('.example_lines .example').each((j, element2) => {
            console.log(j, $(element2).find('.tag_s').text().trim())

            // only take first example
            if (j == 0) {
                result.examples.push({
                    level: LEVEL_TYPE.INTERMEDIATE,
                    mono: $(element2).find('.tag_s').text().trim(),
                    trans: $(element2).find('.tag_t').text().trim()
                });
            }
        });
        results.push(result);
    });

    // And then save output
    const output = {
        crawledAt: new Date(),
        name: 'apify/igsys/linguee',
        input,
        definitions: results,
    };
    console.log('My output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);
});
