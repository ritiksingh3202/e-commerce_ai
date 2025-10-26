import * as cheerio from 'cheerio';

export type ScrapedProduct = {
    id: string;
    name: string;
    price: number;
    image?: string;
    productUrl?: string;
    source: string;
    rating?: number;
    inStock?: boolean;
};

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5..0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

const fetchWithTimeout = async (url: string, timeout = 10000): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

const parsePrice = (priceText: string): number => {
    const cleaned = priceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
};

export async function scrapeAmazon(query: string, limit = 5): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    try {
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        const response = await fetchWithTimeout(searchUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        $('.s-result-item[data-component-type="s-search-result"]').slice(0, limit).each((_, element) => {
            const $el = $(element);
            const name = $el.find('h2 a span').first().text().trim();
            const priceText = $el.find('.a-price-whole').first().text().trim();
            const image = $el.find('img.s-image').attr('src');
            const link = $el.find('h2 a').attr('href');
            const ratingText = $el.find('.a-icon-alt').first().text().trim();
            const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : undefined;

            if (name && priceText) {
                products.push({
                    id: `amazon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    price: parsePrice(priceText),
                    image,
                    productUrl: link ? `https://www.amazon.in${link}` : undefined,
                    source: 'Amazon',
                    rating,
                    inStock: true,
                });
            }
        });
    } catch (error) {
        console.error('Amazon scraping error:', error);
    }
    return products;
}

export async function scrapeFlipkart(query: string, limit = 5): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    try {
        const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
        const response = await fetchWithTimeout(searchUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        $('div._75nLfF[data-id]').slice(0, limit).each((_, element) => {
            const $el = $(element);
            const name = $el.find('div.KzDlHZ').first().text().trim();
            const priceText = $el.find('div.Nx9bqj').first().text().trim();
            const image = $el.find('img.DByuf4').attr('src');
            const link = $el.find('a.CGtC98').attr('href');

            if (name && priceText) {
                products.push({
                    id: `flipkart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    price: parsePrice(priceText),
                    image,
                    productUrl: link ? `https://www.flipkart.com${link}` : undefined,
                    source: 'Flipkart',
                    rating: 4.0,
                    inStock: true,
                });
            }
        });

        $('div[data-component-id]').slice(0, limit).each((_, element) => {
            const $el = $(element);
            const name = $el.find('div.KzDlHZ, div._6Wi-bA').first().text().trim();
            const priceText = $el.find('div.Nx9bqj, div._30jeq3').first().text().trim();
            const image = $el.find('img.DByuf4, img._396cs4').attr('src');
            const link = $el.find('a._1fQZEK, a.s1Q9rs').attr('href');

            if (name && priceText) {
                products.push({
                    id: `flipkart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    price: parsePrice(priceText),
                    image,
                    productUrl: link ? `https://www.flipkart.com${link}` : undefined,
                    source: 'Flipkart',
                    rating: 4.0,
                    inStock: true,
                });
            }
        });
    } catch (error) {
        console.error('Flipkart scraping error:', error);
    }
    return products;
}

export async function scrapeMyntra(query: string, limit = 5): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    try {
        const searchUrl = `https://www.myntra.com/${encodeURIComponent(query)}`;
        const response = await fetchWithTimeout(searchUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        $('li.product-base').slice(0, limit).each((_, element) => {
            const $el = $(element);
            const name = $el.find('h4.product-product').first().text().trim();
            const priceText = $el.find('span.product-discountedPrice').first().text().trim() ||
                              $el.find('span:first-child').first().text().trim();
            const image = $el.find('img.img-responsive').attr('src');
            const link = $el.find('a').attr('href');

            if (name && priceText) {
                products.push({
                    id: `myntra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    price: parsePrice(priceText),
                    image,
                    productUrl: link ? `https://www.myntra.com${link}` : undefined,
                    source: 'Myntra',
                    rating: 4.0,
                    inStock: true,
                });
            }
        });
    } catch (error) {
        console.error('Myntra scraping error:', error);
    }
    return products;
}

export async function scrapeAjio(query: string, limit = 5): Promise<ScrapedProduct[]> {
    const products: ScrapedProduct[] = [];
    try {
        const searchUrl = `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`;
        const response = await fetchWithTimeout(searchUrl);
        const html = await response.text();
        const $ = cheerio.load(html);

        $('div.item').slice(0, limit).each((_, element) => {
            const $el = $(element);
            const name = $el.find('div.name').first().text().trim();
            const priceText = $el.find('div.price').first().text().trim();
            const image = $el.find('img').attr('src');
            const link = $el.find('a').attr('href');

            if (name && priceText) {
                products.push({
                    id: `ajio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name,
                    price: parsePrice(priceText),
                    image,
                    productUrl: link ? `https://www.ajio.com${link}` : undefined,
                    source: 'Ajio',
                    rating: 4.0,
                    inStock: true,
                });
            }
        });
    } catch (error) {
        console.error('Ajio scraping error:', error);
    }
    return products;
}

export async function scrapeAllPlatforms(query: string, limit = 5): Promise<ScrapedProduct[]> {
    const allProducts = await Promise.allSettled([
        scrapeAmazon(query, limit),
        scrapeFlipkart(query, limit),
        scrapeMyntra(query, limit),
        scrapeAjio(query, limit),
    ]);

    const results: ScrapedProduct[] = [];
    allProducts.forEach((result) => {
        if (result.status === 'fulfilled') {
            results.push(...result.value);
        }
    });

    return results.sort((a, b) => a.price - b.price);
}
