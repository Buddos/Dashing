import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RotateCcw, Star } from "lucide-react";
import heroImage from "@/assets/hero-fashion.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import categoryClothing from "@/assets/category-clothing.jpg";
import categoryShoes from "@/assets/category-shoes.jpg";

const featuredProducts = [
  { id: 1, name: "Tailored Wool Blazer", price: 189, salePrice: 149, image: categoryClothing, badge: "Sale" },
  { id: 2, name: "Leather Crossbody Bag", price: 120, image: categoryAccessories },
  { id: 3, name: "Classic Oxford Shoes", price: 165, image: categoryShoes },
  { id: 4, name: "Silk Blend Scarf", price: 75, image: categoryAccessories, badge: "New" },
];

const categories = [
  { name: "Clothing", image: categoryClothing, count: 124 },
  { name: "Accessories", image: categoryAccessories, count: 86 },
  { name: "Shoes", image: categoryShoes, count: 53 },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <img
          src={heroImage}
          alt="Dashing fashion collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="relative container mx-auto px-4 lg:px-8 h-full flex items-center">
          <div className="max-w-xl animate-fade-in">
            <p className="font-body text-sm uppercase tracking-[0.3em] text-primary-foreground/80 mb-4">
              Spring / Summer 2026
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6">
              Redefine Your <em className="italic text-gold">Style</em>
            </h1>
            <p className="font-body text-base md:text-lg text-primary-foreground/80 mb-8 max-w-md leading-relaxed">
              Discover our curated collection of premium fashion pieces crafted for the modern individual.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-gold">
                Shop Collection
              </Link>
              <Link to="/new-arrivals" className="btn-outline-dark border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: "Free Shipping", desc: "On orders over KES 100" },
              { icon: Shield, label: "Secure Payment", desc: "100% protected" },
              { icon: RotateCcw, label: "Easy Returns", desc: "30-day returns" },
              { icon: Star, label: "Premium Quality", desc: "Curated selection" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-accent/10">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">{label}</p>
                  <p className="font-body text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="section-heading mb-3">Shop by Category</h2>
          <p className="section-subheading">Find exactly what you're looking for</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              to="/shop"
              className="group relative aspect-[4/5] overflow-hidden rounded-sm"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-semibold text-primary-foreground mb-1">{cat.name}</h3>
                <p className="font-body text-sm text-primary-foreground/70">{cat.count} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-heading mb-3">Featured Products</h2>
              <p className="section-subheading">Handpicked for you</p>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 font-body text-sm font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1 rounded-sm">
                      {product.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-body text-sm font-medium text-foreground group-hover:text-accent transition-colors mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  {product.salePrice ? (
                    <>
                      <span className="font-body text-sm font-semibold text-accent">KES {product.salePrice}</span>
                      <span className="font-body text-xs text-muted-foreground line-through">KES {product.price}</span>
                    </>
                  ) : (
                    <span className="font-body text-sm font-semibold text-foreground">KES {product.price}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/shop" className="btn-outline-dark inline-block">View All Products</Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="bg-primary rounded-sm p-10 md:p-16 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Up to 40% Off <em className="italic text-gold">Everything</em>
          </h2>
          <p className="font-body text-base text-primary-foreground/70 mb-8 max-w-md mx-auto">
            Don't miss our biggest sale of the season. Limited time only.
          </p>
          <Link to="/deals" className="btn-gold inline-block">
            Shop Deals
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
