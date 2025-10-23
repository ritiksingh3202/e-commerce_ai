import { Suspense } from "react";
import SearchFilter from "./components/SearchFilter";
import ProductGrid from "./components/ProductGrid";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          E-Commerce Product Search
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Search across platforms like Amazon, Flipkart, Myntra, and Ajio for price comparison
        </p>
        <SearchFilter />
        <Suspense fallback={<div>Loading...</div>}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}