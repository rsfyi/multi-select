import React, { useState } from "react";
import { MultiSelect } from "@/components/multi-select";

interface Product {
  id: number;
  title: string;
  category: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    if (products.length > 0) return; // Don't fetch if we already have products
    setLoading(true);
    try {
      const response = await fetch("https://dummyjson.com/products?limit=200");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const productOptions = products.map((product) => ({
    value: product.id.toString(),
    label: product.title,
  }));

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Product Selection</h1>
      <MultiSelect
        options={productOptions}
        onValueChange={setSelectedProducts}
        defaultValue={selectedProducts}
        placeholder="Select products"
        variant="inverted"
        animation={2}
        maxCount={3}
        onOpen={fetchProducts}
        loading={loading}
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Selected Products:</h2>
        <ul className="list-disc list-inside">
          {selectedProducts.map((productId) => {
            const product = products.find((p) => p.id.toString() === productId);
            return product && <li key={productId}>{product.title}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}
