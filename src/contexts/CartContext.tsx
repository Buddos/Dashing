import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  salePrice?: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: { id: number; name: string; price: number; salePrice?: number; imageUrl: string }, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  totalItems: 0,
  subtotal: 0,
});

export const useCart = () => useContext(CartContext);

// Local storage key for guest cart
const GUEST_CART_KEY = "dashing_guest_cart";

const getGuestCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const setGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from local storage for guests
  useEffect(() => {
    if (!user) {
      setItems(getGuestCart());
    }
  }, [user]);

  // Sync guest cart to local storage
  useEffect(() => {
    if (!user) {
      setGuestCart(items);
    }
  }, [items, user]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.quantity, 0);

  const addToCart = useCallback(async (product: { id: number; name: string; price: number; salePrice?: number; imageUrl: string }, quantity = 1) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      setItems(prev => prev.map(i => i.productId === product.id ? { ...i, quantity: newQty } : i));
    } else {
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        imageUrl: product.imageUrl,
        quantity,
      }]);
    }
    toast.success(`${product.name} added to cart`);
  }, [items]);

  const removeFromCart = useCallback(async (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};
