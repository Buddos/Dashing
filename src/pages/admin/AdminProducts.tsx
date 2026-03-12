import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  badge: string | null;
  stock_quantity: number;
  category_id: number | null;
  rating: number;
  review_count: number;
}

interface Category {
  id: number;
  name: string;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  sale_price: "",
  image_url: "",
  badge: "",
  stock_quantity: "0",
  category_id: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      sale_price: p.sale_price ? String(p.sale_price) : "",
      image_url: p.image_url || "",
      badge: p.badge || "",
      stock_quantity: String(p.stock_quantity),
      category_id: p.category_id ? String(p.category_id) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.price) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      image_url: form.image_url || null,
      badge: form.badge || null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    };

    if (editing) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Error updating product", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product updated" });
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        toast({ title: "Error creating product", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product created" });
      }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      fetchData();
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} products in catalog
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <Card key={p.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-14 w-14 rounded-lg object-cover bg-muted"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    No img
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${p.price.toFixed(2)}
                    {p.sale_price && (
                      <span className="ml-2 text-destructive">
                        Sale: ${p.sale_price.toFixed(2)}
                      </span>
                    )}
                    <span className="ml-2">• Stock: {p.stock_quantity}</span>
                  </p>
                </div>
                {p.badge && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">
                    {p.badge}
                  </span>
                )}
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No products yet. Add your first product.
            </p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => {
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editing ? form.slug : generateSlug(e.target.value),
                  });
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Slug *</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Sale Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Stock</label>
                <Input
                  type="number"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Badge</label>
              <Input
                placeholder="e.g. New, Sale, Bestseller"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
