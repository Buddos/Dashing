import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      // Get seller's products
      const { data: sellerProducts } = await supabase
        .from("seller_products")
        .select("product_id")
        .eq("seller_id", user.id);

      const productIds = sellerProducts?.map((sp) => sp.product_id) || [];

      // Get order items for seller's products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*, orders(status, created_at)")
        .in("product_id", productIds.length ? productIds : [0]);

      const revenue = orderItems?.reduce((sum, oi) => sum + Number(oi.price) * oi.quantity, 0) || 0;
      const orderIds = new Set(orderItems?.map((oi) => oi.order_id));
      const pendingOrders = orderItems?.filter((oi: any) => oi.orders?.status === "pending") || [];

      setStats({
        products: productIds.length,
        orders: orderIds.size,
        revenue,
        pending: new Set(pendingOrders.map((o) => o.order_id)).size,
      });

      // Recent orders
      const recent = orderItems
        ?.sort((a: any, b: any) => new Date(b.orders?.created_at || 0).getTime() - new Date(a.orders?.created_at || 0).getTime())
        .slice(0, 5) || [];
      setRecentOrders(recent);
    };

    fetchStats();
  }, [user]);

  const statCards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "text-accent" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "text-primary" },
    { label: "Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { label: "Pending Orders", value: stats.pending, icon: TrendingUp, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seller Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((oi) => (
                <div key={oi.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{oi.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {oi.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${(Number(oi.price) * oi.quantity).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{(oi as any).orders?.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
