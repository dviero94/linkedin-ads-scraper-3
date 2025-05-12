import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

await Actor.init();

const { startUrls = [] } = await Actor.getInput() ?? {};

const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: async ({ request, page }) => {
        console.log(`Processing ${request.url}...`);

        // Cattura uno screenshot prima di attendere il caricamento degli elementi
        const screenshot = await page.screenshot({ fullPage: true });
        await Actor.setValue(`screenshot-${Date.now()}.png`, screenshot, { contentType: 'image/png' });

        // Attendi che l'elemento desiderato sia presente
        await page.waitForSelector('title');

        // Estrai i dati desiderati
        const title = await page.title();

        // Salva i dati nel Dataset
        await Actor.pushData({ url: request.url, title });
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
