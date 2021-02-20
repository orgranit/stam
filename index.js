const puppeteer = require('puppeteer');
//Include to be able to export files w/ node
const fs = require('fs');
const fse = require('fs-extra');
const critical = require('critical');


(async () => {
    const siteName = 'kre8.tv'
    const dirPath = './sites/kre8.tv'
    const siteUrl = `https://${siteName}/`
    const stam = require("@wix/puppeteer-interception-pipeline")
    const InterceptionPipeline = stam.InterceptionPipeline
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // setup a pipeline
    const pipeline = new InterceptionPipeline();
    pipeline.add({
        patterns: [{ urlPattern: "*" }],
        async responseHandler({ response, request }) {
            const {url} = request
            if (url.includes(siteUrl)) {
                const isRoot = url === siteUrl
                const file = isRoot ?  'index.html' : url.replace(siteUrl, '')
                const body = await response.readBody()
                fse.outputFile(`${dirPath}/${file}`, body, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                });
            }

            return body

        },
    });
    await pipeline.setup(page);


    //Begin collecting CSS coverage data
    // await Promise.all([
    //     page.coverage.startCSSCoverage()
    // ]);

    //Visit desired page
    await page.goto(siteUrl);

    //Stop collection and retrieve the coverage iterator
    // const cssCoverage = await Promise.all([
    //     page.coverage.stopCSSCoverage(),
    // ]);

    //Investigate CSS Coverage and Extract Used CSS
    // const css_coverage = [...cssCoverage];
    // let css_used_bytes = 0;
    // let css_total_bytes = 0;
    // let covered_css = "";
    // debugger
    // for (const entry of css_coverage[0]) {
    //     css_total_bytes += entry.text.length;
    //     console.log(`Total Bytes for ${entry.url}: ${entry.text.length}`);
    //     for (const range of entry.ranges) {
    //         css_used_bytes += range.end - range.start - 1;
    //         covered_css += entry.text.slice(range.start, range.end) + "\n";
    //     }
    // }
    //
    // console.log(`Total Bytes of CSS: ${css_total_bytes}`);
    // console.log(`Used Bytes of CSS: ${css_used_bytes}`);
    // fs.writeFile("./exported_css.css", covered_css, function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     console.log("The file was saved!");
    // });

    await browser.close();
    const src =  `${dirPath}/index.html`
    const target =  `${dirPath}/optimized.html`
    critical.generate({
        base: './',
        src,
        target,
        inline: true,
        dimensions: [
            {
                height: 500,
                width: 300,
            },
            {
                height: 720,
                width: 1280,
            },
        ]
    });
    fse.outputFile(src, fse.readFileSync(src, 'utf-8').split('="/').join(`="/stam/sites/${siteName}/`))
    fse.outputFile(target, fse.readFileSync(target, 'utf-8').split('="/').join(`="/stam/sites/${siteName}/`))
})()