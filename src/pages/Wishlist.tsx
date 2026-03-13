import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WishlistProduct {
  wishlistId: string;
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  badge: string | null;
}

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("wishlist")
      .select("id, product_id, products(id, name, slug, price, sale_price, image_url, badge)")
      .eq("user_id", user.id);

    if (!error && data) {
      setItems(
        data
          .filter((w: any) => w.products)
          .map((w: any) => ({
            wishlistId: w.id,
            id: w.products.id,
            name: w.products.name,
            slug: w.products.slug,
            price: w.products.price,
            salePrice: w.products.sale_price,
            imageUrl: w.products.image_url,
            badge: w.products.badge,
          }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const removeItem = async (wishlistId: string) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", wishlistId);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.wishlistId !== wishlistId));
      toast.success("Removed from wishlist");
    }
  };

  const moveToCart = async (item: WishlistProduct) => {
    await addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      salePrice: item.salePrice ?? undefined,
      imageUrl: item.imageUrl ?? "/placeholder.svg",
    });
    await removeItem(item.wishlistId);
  };

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Heart size={48} className="text-muted-foreground mb-4" />
        <h1 className="font-display text-3xl text-foreground mb-2">Your Wishlist</h1>
        <p className="font-body text-muted-foreground mb-6">Sign in to save your favorite items.</p>
        <Button asChild><Link to="/login">Sign In</Link></Button>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-20 flex justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-8 py-10 min-h-[60vh]">
      <h1 className="font-display text-3xl md:text-4xl text-foreground mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="font-body text-lg text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Button asChild variant="outline"><Link to="/shop">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.wishlistId} className="group border border-border rounded-lg overflow-hidden bg-card">
              <Link to={`/product/${item.slug}`} className="block">
                <div className="relative aspect-[3/4] bg-muted">
                  <img
                    src={item.imageUrl ?? "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {item.badge && (
                    <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1 rounded-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-4 space-y-3">
                <Link to={`/product/${item.slug}`}>
                  <h3 className="font-body text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  {item.salePrice ? (
                    <>
                      <span className="font-body text-sm font-semibold text-accent">${item.salePrice}</span>
                      <span className="font-body text-xs text-muted-foreground line-through">${item.price}</span>
                    </>
                  ) : (
                    <span className="font-body text-sm font-semibold text-foreground">${item.price}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => moveToCart(item)}>
                    <ShoppingBag size={14} /> Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeItem(item.wishlistId)} aria-label="Remove">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Wishlist;
