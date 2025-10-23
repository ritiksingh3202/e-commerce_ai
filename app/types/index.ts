export type Product = {
    id: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    brand?: string;
    rating?: number;
    colors?: string[];
    features?: string[];
    image?: string;
    inStock?: boolean;
    source?: string;
    productUrl?: string;
    score?: number;
}