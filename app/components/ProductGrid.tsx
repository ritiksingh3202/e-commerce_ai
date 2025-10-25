"use client";
import React, { useEffect, useState } from 'react'
import { Product } from '../types';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

type ApiResponse = {
    products?: Product[];
    source?: string;
    count?: number;
} | Product[];

const ProductGrid = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const query = searchParams.get("q");

                if (!query) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                const response = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query }),
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }

                const data: ApiResponse = await response.json();

                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data.products) {
                    setProducts(data.products);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setError(error instanceof Error ? error.message : "Failed to fetch products");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchParams]);

    if (loading) return (
        <div className='text-gray-500 text-center mt-10'>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Searching across platforms...</p>
        </div>
    );

    if (error) {
        return <p className='text-red-500 text-center mt-5'>Error: {error}</p>
    }

    if (!products.length) {
        return (
            <p className='text-gray-500 text-center mt-5'>No Products found, Try different search term</p>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Products from Amazon, Flipkart, Myntra, Ajio
                </h2>
                <span className="text-sm text-gray-500">
                    {products.length} product{products.length !== 1 ? 's' : ''} found
                </span>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;