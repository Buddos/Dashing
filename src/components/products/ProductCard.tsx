import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="group animate-fade-in">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-3">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1 rounded-sm">
              {product.badge}
            </span>
          )}
          <button
            className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:text-accent"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Add to wishlist"
          >
            <Heart size={16} />
          </button>
        </div>
      </Link>

      <div className="space-y-1">
        <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">{product.categoryName}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-body text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          <Star size={12} className="fill-accent text-accent" />
          <span className="font-body text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount})
          </span>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          {product.salePrice ? (
            <>
              <span className="font-body text-sm font-semibold text-accent">${product.salePrice}</span>
              <span className="font-body text-xs text-muted-foreground line-through">${product.price}</span>
            </>
          ) : (
            <span className="font-body text-sm font-semibold text-foreground">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
