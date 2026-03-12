import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColor: Record<string, string> = {
  pending: "bg-accent/10 text-accent-foreground",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Order marked ${status}` });
      fetchOrders();
    }
  };

  const viewDetails = async (order: any) => {
    setSelected(order);
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setItems(data || []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {orders.length} total orders
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-border/50 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => viewDetails(order)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.shipping_name || "Guest"} •{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  ${Number(order.total).toFixed(2)}
                </p>
                <Select
                  value={order.status}
                  onValueChange={(v) => {
                    updateStatus(order.id, v);
                  }}
                >
                  <SelectTrigger
                    className="w-32"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Order #{selected?.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{selected.shipping_name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColor[selected.status]}>
                    {selected.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="text-foreground text-xs">
                    {[selected.shipping_address, selected.shipping_city, selected.shipping_state, selected.shipping_zip]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="text-foreground">
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium text-foreground mb-2">Items</p>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-1.5"
                  >
                    <span className="text-foreground">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${Number(selected.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">${Number(selected.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">${Number(selected.shipping).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>${Number(selected.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
