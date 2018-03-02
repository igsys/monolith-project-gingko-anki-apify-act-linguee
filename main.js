const Apify = require('apify');
const request = require('request-promise');
const cheerio = require('cheerio');

Apify.main(async () => {
    // Get input of your act
    const input = await Apify.getValue('INPUT');

    if (!input || !input.query || !input.source || !input.dictionary) throw new Error('Invalid input, must be a JSON object with the fields!');

    console.log('My input:');
    console.dir(input);

    // Do something useful here
    const html = await request(`https://www.linguee.com/${input.dictionary}/search?source=${input.source}&query=${input.query}`);
    const $ = cheerio.load(html)

    // And then save output
    const output = {
        crawledAt: new Date(),
        dictionary: $('.dict_headline_for_0').text().trim()
    };
    console.log('My output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);
});
