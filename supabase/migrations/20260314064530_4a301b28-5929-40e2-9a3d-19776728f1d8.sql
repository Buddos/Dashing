
-- Create seller_products table so sellers manage their own products
CREATE TABLE IF NOT EXISTS public.seller_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  product_id integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(seller_id, product_id)
);

ALTER TABLE public.seller_products ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own linked products
CREATE POLICY "Sellers can view own products" ON public.seller_products
  FOR SELECT TO authenticated
  USING (auth.uid() = seller_id OR has_role(auth.uid(), 'admin'));

-- Sellers can link products they create
CREATE POLICY "Sellers can insert own products" ON public.seller_products
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id AND has_role(auth.uid(), 'seller'));

-- Sellers can remove their own product links
CREATE POLICY "Sellers can delete own products" ON public.seller_products
  FOR DELETE TO authenticated
  USING (auth.uid() = seller_id);

-- Allow sellers to insert products
CREATE POLICY "Sellers can insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'seller'));

-- Allow sellers to update their own products
CREATE POLICY "Sellers can update own products" ON public.products
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_products sp
      WHERE sp.product_id = products.id AND sp.seller_id = auth.uid()
    )
  );

-- Allow sellers to delete their own products
CREATE POLICY "Sellers can delete own products" ON public.products
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_products sp
      WHERE sp.product_id = products.id AND sp.seller_id = auth.uid()
    )
  );

-- Allow sellers to view order_items for their products
CREATE POLICY "Sellers can view order items for own products" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_products sp
      WHERE sp.product_id = order_items.product_id AND sp.seller_id = auth.uid()
    )
  );

-- Allow sellers to view orders containing their products
CREATE POLICY "Sellers can view orders with own products" ON public.orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.seller_products sp ON sp.product_id = oi.product_id
      WHERE oi.order_id = orders.id AND sp.seller_id = auth.uid()
    )
  );
