"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { IoIosSearch } from "react-icons/io";

const SearchFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const query = formData.get("q")?.toString().trim();
        if (query) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="w-full">
                <div className="relative mb-3">
                    <input
                        name="q"
                        type="text"
                        defaultValue={searchParams.get("q") || ""}
                        placeholder="Search products on Amazon, Flipkart, Myntra, Ajio (e.g. 'adidas shoes')"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <IoIosSearch className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
            </form>
            
            <p className="text-xs text-gray-500 text-center">
                Searches across Amazon, Flipkart, Myntra, Ajio • Prices shown for comparison
            </p>
        </div>
    )
}

export default SearchFilter;