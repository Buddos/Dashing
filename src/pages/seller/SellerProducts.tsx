import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string;
  stock_quantity: string;
  image_url: string;
  badge: string;
  category_id: string;
}

const emptyForm: ProductForm = {
  name: "", slug: "", description: "", price: "", sale_price: "",
  stock_quantity: "0", image_url: "", badge: "", category_id: "",
};

export default function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const fetchProducts = async () => {
    if (!user) return;
    const { data: sp } = await supabase
      .from("seller_products")
      .select("product_id")
      .eq("seller_id", user.id);
    const ids = sp?.map((s) => s.product_id) || [];
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .in("id", ids)
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    supabase.from("categories").select("*").then(({ data }) => setCategories(data || []));
  }, [user]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!user || !form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const slug = form.slug || generateSlug(form.name);
    const payload = {
      name: form.name,
      slug,
      description: form.description,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      image_url: form.image_url || null,
      badge: form.badge || null,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) toast.error(error.message);
      else toast.success("Product updated");
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select().single();
      if (error) {
        toast.error(error.message);
      } else {
        // Link product to seller
        await supabase.from("seller_products").insert({
          seller_id: user.id,
          product_id: data.id,
        });
        toast.success("Product created");
      }
    }

    setSaving(false);
    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    fetchProducts();
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: String(p.price),
      sale_price: p.sale_price ? String(p.sale_price) : "",
      stock_quantity: String(p.stock_quantity),
      image_url: p.image_url || "",
      badge: p.badge || "",
      category_id: p.category_id ? String(p.category_id) : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("seller_products").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted");
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Products</h1>
          <p className="text-muted-foreground">Manage your product listings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price *</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Sale Price</Label>
                  <Input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Badge</Label>
                <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">None</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                  <option value="Best Seller">Best Seller</option>
                </select>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-center">Loading...</p>
          ) : products.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">No products yet. Add your first product!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.image_url && <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-md object-cover" />}
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          {p.badge && <span className="text-xs text-accent">{p.badge}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.sale_price ? (
                        <div>
                          <span className="line-through text-muted-foreground text-xs">${p.price}</span>
                          <span className="ml-1 font-medium">${p.sale_price}</span>
                        </div>
                      ) : (
                        <span>${p.price}</span>
                      )}
                    </TableCell>
                    <TableCell>{p.stock_quantity}</TableCell>
                    <TableCell>{p.categories?.name || "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
