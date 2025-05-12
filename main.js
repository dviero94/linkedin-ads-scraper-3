import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const { startUrls = [] } = await Actor.getInput() ?? {};

const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: async ({ request, page }) => {
        console.log(`Processing ${request.url}...`);

        // Screenshot immediato (anche se la pagina non carica bene)
        const screenshot = await page.screenshot({ fullPage: true });
        await Actor.setValue(`screenshot-${Date.now()}.png`, screenshot, { contentType: 'image/png' });

        // Prova a prendere il titolo senza aspettare
        const title = await page.title().catch(() => 'No title');

        await Actor.pushData({
            url: request.url,
            title
        });
    },
    launchContext: {
        launchOptions: {
            headless: true,
            args: ['--disable-gpu'],
        },
    },
});

await crawler.run(startUrls);

await Actor.exit();
