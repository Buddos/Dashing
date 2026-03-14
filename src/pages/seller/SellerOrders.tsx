import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data: sp } = await supabase
        .from("seller_products")
        .select("product_id")
        .eq("seller_id", user.id);

      const productIds = sp?.map((s) => s.product_id) || [];
      if (productIds.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*, orders(id, status, created_at, shipping_name, total)")
        .in("product_id", productIds)
        .order("created_at", { ascending: false });

      // Group by order
      const orderMap = new Map<string, any>();
      orderItems?.forEach((oi: any) => {
        const orderId = oi.order_id;
        if (!orderMap.has(orderId)) {
          orderMap.set(orderId, {
            ...oi.orders,
            items: [],
            sellerRevenue: 0,
          });
        }
        const order = orderMap.get(orderId)!;
        order.items.push(oi);
        order.sellerRevenue += Number(oi.price) * oi.quantity;
      });

      setOrders(Array.from(orderMap.values()));
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Order Fulfillment</h1>
        <p className="text-muted-foreground">Orders containing your products</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground text-center">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="p-6 text-muted-foreground text-center">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Your Products</TableHead>
                  <TableHead>Your Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}...</TableCell>
                    <TableCell>{o.shipping_name || "—"}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {o.items.map((item: any) => (
                          <p key={item.id} className="text-sm">
                            {item.product_name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${o.sellerRevenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[o.status] || ""}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()}
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
