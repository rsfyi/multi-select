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
}

interface ProductOption {
  id: string;
  productName: string;
  isSelectedForProductBenefit: boolean;
}

const schema = z.object({
  products: z.array(z.string()).min(1, "Please select at least one product."),
});

export default function About() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
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

      // Store base product data
      setProducts(data.products);

      // Create product options with all selected initially
      const options: ProductOption[] = data.products.map(
        (product: Product) => ({
          id: product.id.toString(),
          productName: product.title,
          isSelectedForProductBenefit: true,
        })
      );

      setProductOptions(options);

      // Set initial selected values in form
      const initialSelectedIds = options.map((option) => option.id);
      setValue("products", initialSelectedIds, { shouldValidate: true });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value: string[]) => {
    // Update form value
    setValue("products", value, { shouldValidate: true });

    // Update isSelectedForProduct state in productOptions
    setProductOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        isSelectedForProductBenefit: value.includes(option.id),
      }))
    );
  };

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
              onValueChange={handleValueChange}
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
