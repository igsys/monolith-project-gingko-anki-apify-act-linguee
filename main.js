const Apify = require('apify');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const results = [];

Apify.main(async () => {
    // Get input of your act
    const input = await Apify.getValue('INPUT');

    if (!input || !input.query || !input.source || !input.dictionary) throw new Error('Invalid input, must be a JSON object with the fields!');

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
            result.examples.push({
                index: j,
                mono: $(element2).find('.tag_s').text().trim(),
                trans: $(element2).find('.tag_t').text().trim()
            });
        });
        results.push(result);
    });

    // And then save output
    const output = {
        crawledAt: new Date(),
        keyword: input.query,
        results: results,
        // html
    };
    console.log('My output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);
});
