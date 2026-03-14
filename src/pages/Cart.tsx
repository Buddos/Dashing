import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="font-body text-muted-foreground mb-6">Looks like you haven't added anything yet</p>
          <Link to="/shop" className="btn-gold inline-block">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Shopping Cart ({totalItems})</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 border border-border rounded-sm bg-card">
                <img src={item.imageUrl} alt={item.name} className="w-24 h-28 object-cover rounded-sm" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-body text-sm font-medium text-foreground">{item.name}</h3>
                    <p className="font-body text-sm text-accent font-semibold mt-1">${(item.salePrice ?? item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-sm">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1.5 text-foreground hover:bg-muted">
                        <Minus size={14} />
                      </button>
                      <span className="font-body text-xs font-medium w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1.5 text-foreground hover:bg-muted">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-sm p-6 bg-card sticky top-28">
              <h2 className="font-display text-lg font-semibold text-foreground mb-6">Order Summary</h2>
              <div className="space-y-3 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (est.)</span>
                  <span className="text-foreground font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-foreground font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
              {shipping > 0 && (
                <p className="font-body text-xs text-muted-foreground mt-3">Free shipping on orders over KES 100</p>
              )}
              <Link to="/checkout">
                <Button className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold uppercase tracking-wide h-12">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link to="/shop" className="block text-center font-body text-sm text-muted-foreground hover:text-foreground mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
