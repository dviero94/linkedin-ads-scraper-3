import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const { startUrls = [] } = await Actor.getInput() ?? {};

const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: async ({ request, page }) => {
        console.log(`Processing ${request.url}...`);

        // Screenshot prima di tutto
        const screenshot = await page.screenshot({ fullPage: true });
        await Actor.setValue(`screenshot-${Date.now()}.png`, screenshot, { contentType: 'image/png' });

        // Titolo della pagina per conferma
        const title = await page.title().catch(() => 'NO TITLE');

        console.log(`Page title: ${title}`);

        await Actor.pushData({
            url: request.url,
            title
        });
    },
    launchContext: {
        launchOptions: {
            headless: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-gpu',
                '--no-sandbox',
            ],
        },
    },
    preNavigationHooks: [
        async ({ page }) => {
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
            );
        },
    ],
});

await crawler.run(startUrls);

await Actor.exit();
