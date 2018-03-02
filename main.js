const Apify = require('apify');
const request = require('request-promise');
const cheerio = require('cheerio');

const results = [];

Apify.main(async () => {
    // Get input of your act
    const input = await Apify.getValue('INPUT');

    if (!input || !input.query || !input.source || !input.dictionary) throw new Error('Invalid input, must be a JSON object with the fields!');

    console.log('My input:');
    console.dir(input);

    // Do something useful here
    const html = await request(`https://www.linguee.com/${input.dictionary}/search?source=${input.source}&query=${input.query}`);
    const $ = cheerio.load(html)


    // get meaning and examples:
    $('.sortablemg.featured').each(function () {
        let result = {}
        result['meaning'] = $(this).find('.dictLink.featured').text().trim();
        result['grammar'] = $(this).find('.tag_type').text().trim();
        result.examples = [];

        $(this).find('.example_lines').each(function (i) {
            result.examples.push({
                index: i,
                mono: $(this).find('.tag_e').eq(i).find('.tag_s').text().trim(),
                trans: $(this).find('.tag_e').eq(i).find('.tag_t').text().trim()
            });
        });

        results.push(result);
    });

    // And then save output
    const output = {
        crawledAt: new Date(),
        results: results,
        dictionary: $('.dict_headline_for_0').text().trim(),
    };
    console.log('My output:');
    console.dir(output);
    await Apify.setValue('OUTPUT', output);
});
