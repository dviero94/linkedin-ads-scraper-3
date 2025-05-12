import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();
const input = await Actor.getInput();

const {
    search_url,
    companies = [],
    limit = 10,
    combine_companies_onesearch = false,
    type_search = "search_word",
    proxyConfiguration: proxyInput
} = input;

const proxyConfiguration = await Actor.createProxyConfiguration(proxyInput || {});

const urlsToScrape = combine_companies_onesearch
    ? [search_url]
    : companies.map((companyUrl) => {
        const accountOwner = new URL(companyUrl).pathname.split('/').filter(Boolean).pop();
        return `https://www.linkedin.com/ad-library/search?accountOwner=${accountOwner}`;
    });

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandlerTimeoutSecs: 60,
    maxRequestsPerCrawl: limit,
    requestHandler: async ({ request, page, pushData }) => {
        console.log(`Scraping: ${request.url}`);

        // Screenshot diagnostico
        const screenshot = await page.screenshot({ fullPage: true });
        await Actor.setValue(`screenshot-${Date.now()}.png`, screenshot, { contentType: 'image/png' });

        // Estrazione minima per test iniziale
        const title = await page.title().catch(() => 'NO TITLE');
        await pushData({ url: request.url, title });
    },
    launchContext: {
        launchOptions: {
            headless: true,
            args: ['--no-sandbox', '--disable-gpu']
        }
    },
    preNavigationHooks: [
        async ({ page }) => {
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
            );
        }
    ]
});

await crawler.run(urlsToScrape);
await Actor.exit();
