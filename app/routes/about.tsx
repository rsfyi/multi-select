import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MultiSelect } from "@/components/multi-select";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  title: string;
  category: string;
  isProductSelected?: boolean;
}

const schema = z.object({
  products: z.array(z.string()).min(1, "Please select at least one product."),
});

export default function About() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      products: [],
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = form;

  const selectedProducts = watch("products");

  const fetchProducts = async () => {
    if (products.length > 0) return;
    setLoading(true);
    try {
      const response = await fetch("https://dummyjson.com/products?limit=200");
      const data = await response.json();

      // Mark all products as selected (simulating API response)
      const productsWithSelection = data.products.map((product: Product) => ({
        ...product,
        isProductSelected: true,
      }));

      setProducts(productsWithSelection);

      // Get IDs of pre-selected products and update form
      const preSelectedIds = productsWithSelection
        .filter((p) => p.isProductSelected)
        .map((p) => p.id.toString());

      setValue("products", preSelectedIds, { shouldValidate: true });
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

  const onSubmit = handleSubmit((data) => {
    const selectedProductTitles = data.products
      .map((id) => products.find((p) => p.id.toString() === id)?.title)
      .filter(Boolean);

    toast(
      `You have selected the following products: ${selectedProductTitles.join(
        ", "
      )}`
    );
  });

  return (
    <main className="flex min-h-screen:calc(100vh - 3rem) flex-col items-center justify-start space-y-3 p-3">
      <Card className="w-full max-w-xl p-5">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-medium">Products</label>
            <MultiSelect
              options={productOptions}
              onValueChange={(value) =>
                setValue("products", value, { shouldValidate: true })
              }
              value={selectedProducts}
              placeholder="Select products"
              variant="inverted"
              animation={2}
              maxCount={3}
              onOpen={fetchProducts}
              loading={loading}
            />
            {errors.products && (
              <p className="text-sm text-red-500">{errors.products.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Card>
    </main>
  );
}
