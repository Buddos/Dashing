import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { products as allProducts, categories } from "@/data/mockProducts";
import ProductGrid from "@/components/products/ProductGrid";
import ProductFilters from "@/components/products/ProductFilters";

type SortOption = "newest" | "price-asc" | "price-desc" | "rating" | "name";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
  name: "Name A–Z",
};

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Update search when URL parameter changes
  useEffect(() => {
    const querySearch = searchParams.get("search");
    if (querySearch) {
      setSearch(querySearch);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) result = result.filter((p) => p.categoryId === cat.id);
    }

    // Price
    result = result.filter((p) => {
      const price = p.salePrice ?? p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sort) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-asc":
        result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [search, selectedCategory, priceRange, sort]);

  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 9999]);
    setSearch("");
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-10 md:py-14">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">Shop</h1>
          <p className="font-body text-muted-foreground">
            Explore our full collection of {allProducts.length} curated pieces
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-sm font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border rounded-sm font-body text-sm text-foreground hover:bg-card transition-colors"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-sm font-body text-sm text-foreground hover:bg-card transition-colors"
              >
                {sortLabels[sort]} <ChevronDown size={14} />
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-border rounded-sm shadow-lg min-w-[180px]">
                    {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setSort(key); setShowSortDropdown(false); }}
                        className={`block w-full text-left px-4 py-2.5 font-body text-sm transition-colors ${
                          sort === key ? "text-accent font-semibold bg-accent/5" : "text-foreground hover:bg-card"
                        }`}
                      >
                        {sortLabels[key]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Result count */}
            <span className="hidden md:block font-body text-sm text-muted-foreground">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-10">
          {/* Sidebar filters — desktop */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              onReset={resetFilters}
            />
          </div>

          {/* Mobile filters drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-foreground/40" onClick={() => setShowFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 text-foreground">
                    <X size={20} />
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={(slug) => { setSelectedCategory(slug); }}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  onReset={resetFilters}
                />
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            <ProductGrid products={filtered} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
