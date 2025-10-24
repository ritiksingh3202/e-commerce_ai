"use client";

import { Product } from "../types";
import Image from "next/image";
import Link from "next/link";


type ProductCardProps = {
    product: Product;
};
export default function ProductCard({ product }: ProductCardProps) {
    const isExternalLink = product.productUrl && product.source;
    const linkHref = isExternalLink ? product.productUrl! : `/products/${product.id}`;
    const linkTarget = isExternalLink ? "_blank" : "_self";
    const linkRel = isExternalLink ? "noopener noreferrer" : undefined;

    return (
        <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm">
            <Link href={linkHref} className="block" target={linkTarget} rel={linkRel}>
                {/*Product Image*/}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <Image
                        src={product.image || "/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 100vw, (max-width:1024px) 50vw, 25vw"
                    />
                    {/* Stock Status Badge*/}
                    {product.inStock === false && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1">
                            Out of Stock
                        </div>
                    )}
                    {/* Source Badge for Live Products */}
                    {product.source && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {product.source}
                        </div>
                    )}
                </div>
                {/* Product Details*/}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {product.name}
                    </h3>
                    {/*Rating*/}
                    <div className="mt-1 flex items-center text-gray-900">
                        <div className="flex items-center">
                            {typeof product.rating === 'number' && (
                                <span className="text-yellow-500">★</span>
                            )}
                            <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                        </div>
                    </div>

                    {/*Price*/}
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                            ₹{product.price.toFixed(2)}
                        </p>
                    </div>

                    {/*Colors - only for local products*/}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500">Colors:</p>
                            <div className="flex space-x-1 mt-1">
                                {product.colors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{ backgroundColor: color.split("/")[0] }}
                                        title={color}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}