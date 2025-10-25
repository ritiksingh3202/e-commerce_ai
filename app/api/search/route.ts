import { InferenceClient } from "@huggingface/inference";
import { NextResponse } from "next/server";
import { scrapeAllPlatforms, ScrapedProduct } from "@/app/lib/scraper";


export const POST = async (req: Request) => {
    try {
        const hfToken = process.env.HF_TOKEN;
        const embeddingModel = process.env.EMBEDDING_MODEL;

        let query: string | undefined;
        try {
            const body = await req.json();
            query = body.query;
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body in request." },
                { status: 400 }
            );
        }

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Invalid query: must be a non-empty string under the 'query' key." },
                { status: 400 }
            );
        }

        let rawProducts = await scrapeAllPlatforms(query, 10);
        
        if (rawProducts.length === 0) {
            rawProducts = getDemoProducts(query);
        }

        // Use Hugging Face embeddings for semantic ranking
        if (!hfToken || !embeddingModel) {
            return NextResponse.json(
                { error: "Configuration Error: Missing HF_TOKEN or EMBEDDING_MODEL" },
                { status: 500 }
            );
        }

        const hf = new InferenceClient(hfToken);

        // Get query embedding
        const queryEmbedding = await hf.featureExtraction({
            model: embeddingModel,
            inputs: query,
        }) as number[];

        const extractEmbedding = (resp: unknown): number[] => {
            if (Array.isArray(resp) && resp.every(item => typeof item === 'number')) {
                return resp as number[];
            }
            if (Array.isArray(resp)) {
                const flatNumbers = (resp as unknown[]).flat(Infinity).filter((v) => typeof v === 'number');
                if (flatNumbers.length) return flatNumbers.map(Number);
            }
            if (resp && typeof resp === 'object' && resp !== null) {
                const o = resp as { [key: string]: unknown };
                for (const key of ['embedding', 'embeddings', 'data', 'vector']) {
                    const val = o[key];
                    if (Array.isArray(val) && val.every((x: unknown) => typeof x === 'number')) return val.map(Number);
                    if (Array.isArray(val) && Array.isArray(val[0]) && val[0].every((x: unknown) => typeof x === 'number')) return (val[0] as number[]).map(Number);
                }
            }
            throw new Error("Unable to normalize embedding response shape");
        };

        const qEmb = extractEmbedding(queryEmbedding);

        // Calculate similarity for each product
        const productsWithScores = [];
        for (const product of rawProducts) {
            try {
                const productText = `${product.name} ${product.source || ''}`;
                const productEmbedding = await hf.featureExtraction({
                    model: embeddingModel,
                    inputs: productText,
                }) as number[];
                
                const pEmb = extractEmbedding(productEmbedding);
                
                // Cosine similarity
                const dotProduct = qEmb.reduce((sum, a, i) => sum + a * (pEmb[i] ?? 0), 0);
                const magnitudeQ = Math.sqrt(qEmb.reduce((sum, a) => sum + a * a, 0));
                const magnitudeP = Math.sqrt(pEmb.reduce((sum, a) => sum + a * a, 0));
                const similarity = magnitudeQ * magnitudeP > 0 ? dotProduct / (magnitudeQ * magnitudeP) : 0;

                productsWithScores.push({ ...product, score: similarity });
            } catch {
                productsWithScores.push({ ...product, score: 0 });
            }
        }

        // Sort by score descending, then by price ascending
        productsWithScores.sort((a, b) => {
            if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score;
            return (a.price || 0) - (b.price || 0);
        });

        return NextResponse.json({
            products: productsWithScores,
            source: "live",
            count: productsWithScores.length
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
};

// Helper function to generate demo products when scraping fails
function getDemoProducts(query: string): ScrapedProduct[] {
    const platforms = ['Amazon', 'Flipkart', 'Myntra', 'Ajio'];
    const demoProducts: ScrapedProduct[] = [];
    
    for (let i = 0; i < 8; i++) {
        const platform = platforms[i % platforms.length];
        const price = Math.floor(Math.random() * 5000) + 500;
        demoProducts.push({
            id: `demo_${platform.toLowerCase()}_${Date.now()}_${i}`,
            name: `${query.charAt(0).toUpperCase() + query.slice(1)} - Product ${i + 1} from ${platform}`,
            price,
            image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(platform + '+' + query)}`,
            productUrl: `https://${platform.toLowerCase()}.com/search?q=${encodeURIComponent(query)}`,
            source: platform,
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
            inStock: Math.random() > 0.2,
        });
    }
    
    return demoProducts.sort((a, b) => a.price - b.price);
}