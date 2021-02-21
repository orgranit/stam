const puppeteer = require('puppeteer');
//Include to be able to export files w/ node
const fs = require('fs');
const fse = require('fs-extra');
const critical = require('critical');


const main = async (siteName) => {
    const domain = `https://${siteName.split('/')[0]}`
    const siteUrl = `https://${siteName}/`


    const relativePath = `sites/${siteName}`
    const dirPath = `./${relativePath}`
    const newUrl = `https://orgranit.github.io/stam/${relativePath}/`

    const handleCORS = (filePath) => {
        const fileContent =  fse.readFileSync(filePath, 'utf-8')
        const fixedContent = fileContent.split('="/').join(`="/stam/sites/${siteName}/`).split(siteUrl).join(newUrl)
        fse.outputFile(filePath, fixedContent)
    }

    const stam = require("@wix/puppeteer-interception-pipeline")
    const InterceptionPipeline = stam.InterceptionPipeline
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // setup a pipeline
    const pipeline = new InterceptionPipeline();
    pipeline.add({
        patterns: [{ urlPattern: `${domain}*` }],
        async responseHandler({ response, request }) {
            const {url} = request
            const isRoot = url === siteUrl
            debugger
            const file = isRoot ?  'index.html' : url.replace(domain, '').split('?')[0]
            const body = await response.readBody()
            fse.outputFile(`${dirPath}/${file}`, body, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });

            return {
                action: 'modify',
                response,
                change: response,
            }

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
    const src =  `index.html`
    const target =  `optimized.html`
    await critical.generate({
        base: `./sites/${siteName}/`,
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

    handleCORS(`${dirPath}/${src}`)
    handleCORS(`${dirPath}/${target}`)
}

main('www.6pm.com')