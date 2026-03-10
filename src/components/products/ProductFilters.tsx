import { X } from "lucide-react";
import type { Category } from "@/types/product";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onReset: () => void;
}

const priceRanges: { label: string; range: [number, number] }[] = [
  { label: "Under $100", range: [0, 100] },
  { label: "$100 – $200", range: [100, 200] },
  { label: "$200 – $300", range: [200, 300] },
  { label: "Over $300", range: [300, 9999] },
];

const ProductFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  onReset,
}: ProductFiltersProps) => {
  const hasActiveFilters = selectedCategory !== null || priceRange[0] !== 0 || priceRange[1] !== 9999;

  return (
    <aside className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="font-body text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Category</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={`font-body text-sm transition-colors w-full text-left py-1 ${
                selectedCategory === null ? "text-accent font-semibold" : "text-foreground hover:text-accent"
              }`}
            >
              All Products
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onCategoryChange(cat.slug)}
                className={`font-body text-sm transition-colors w-full text-left py-1 flex justify-between ${
                  selectedCategory === cat.slug ? "text-accent font-semibold" : "text-foreground hover:text-accent"
                }`}
              >
                {cat.name}
                <span className="text-muted-foreground text-xs">({cat.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Price</h4>
        <ul className="space-y-2">
          {priceRanges.map((pr) => {
            const isActive = priceRange[0] === pr.range[0] && priceRange[1] === pr.range[1];
            return (
              <li key={pr.label}>
                <button
                  onClick={() => onPriceRangeChange(isActive ? [0, 9999] : pr.range)}
                  className={`font-body text-sm transition-colors w-full text-left py-1 ${
                    isActive ? "text-accent font-semibold" : "text-foreground hover:text-accent"
                  }`}
                >
                  {pr.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default ProductFilters;
