import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { products } from "@/data/mockProducts";
import { useCart } from "@/contexts/CartContext";
import { Star, Heart, Minus, Plus, Truck, RotateCcw, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductDetail = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
          <Link to="/shop" className="btn-gold inline-block mt-4">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const effectivePrice = product.salePrice ?? product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  // Mock related products
  const related = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <nav className="flex items-center gap-2 font-body text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-foreground">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-body font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-2">{product.categoryName}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-accent text-accent" : "text-border"} />
                ))}
              </div>
              <span className="font-body text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-foreground">${effectivePrice}</span>
              {product.salePrice && (
                <>
                  <span className="font-body text-lg text-muted-foreground line-through">${product.price}</span>
                  <span className="font-body text-sm font-semibold text-accent">-{discount}%</span>
                </>
              )}
            </div>

            <p className="font-body text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-foreground hover:bg-card transition-colors">
                  <Minus size={16} />
                </button>
                <span className="font-body text-sm font-medium w-10 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-foreground hover:bg-card transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <Button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold uppercase tracking-wide h-12"
              >
                Add to Cart — ${(effectivePrice * quantity).toFixed(2)}
              </Button>
              <button className="p-3 border border-border rounded-sm text-foreground hover:text-accent hover:border-accent transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {/* Stock */}
            <p className="font-body text-xs text-muted-foreground mb-8">
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { icon: Truck, label: "Free Shipping", desc: "Over $100" },
                { icon: RotateCcw, label: "Easy Returns", desc: "30 days" },
                { icon: Shield, label: "Secure", desc: "Payment" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <Icon size={20} className="mx-auto text-accent mb-1" />
                  <p className="font-body text-xs font-medium text-foreground">{label}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-border pt-10">
          <div className="flex gap-8 border-b border-border mb-8">
            {(["description", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-body text-sm font-medium uppercase tracking-wide pb-3 border-b-2 transition-colors ${
                  activeTab === tab ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "description" ? "Description" : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>

          {activeTab === "description" ? (
            <div className="max-w-2xl">
              <p className="font-body text-muted-foreground leading-relaxed">{product.description}</p>
              <ul className="mt-6 space-y-2 font-body text-sm text-muted-foreground">
                <li>• Premium quality materials</li>
                <li>• Expertly crafted construction</li>
                <li>• Designed for everyday elegance</li>
                <li>• Easy care instructions included</li>
              </ul>
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              {[
                { name: "Sarah M.", rating: 5, text: "Absolutely love this! The quality is exceptional and it arrived quickly.", date: "Feb 28, 2026" },
                { name: "James R.", rating: 4, text: "Great product, exactly as described. Fits perfectly.", date: "Feb 15, 2026" },
                { name: "Elena K.", rating: 5, text: "Beautiful craftsmanship. Will definitely buy from DASHING again.", date: "Jan 30, 2026" },
              ].map((review, i) => (
                <div key={i} className="border-b border-border pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={14} className={j < review.rating ? "fill-accent text-accent" : "text-border"} />
                      ))}
                    </div>
                    <span className="font-body text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="font-body text-sm font-medium text-foreground mb-1">{review.name}</p>
                  <p className="font-body text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="section-heading mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-3">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                  <h3 className="font-body text-sm font-medium text-foreground group-hover:text-accent transition-colors">{p.name}</h3>
                  <span className="font-body text-sm font-semibold text-foreground">${p.salePrice ?? p.price}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
