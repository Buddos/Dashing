import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, Star } from "lucide-react";

export default function SellerAnalytics() {
  const { user } = useAuth();
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSold, setTotalSold] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      const { data: sp } = await supabase
        .from("seller_products")
        .select("product_id")
        .eq("seller_id", user.id);

      const productIds = sp?.map((s) => s.product_id) || [];
      if (productIds.length === 0) return;

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*, orders(created_at, status)")
        .in("product_id", productIds);

      if (!orderItems) return;

      // Total revenue & units
      let rev = 0;
      let sold = 0;
      const productMap = new Map<string, { name: string; revenue: number; units: number }>();
      const monthMap = new Map<string, number>();

      orderItems.forEach((oi: any) => {
        const amount = Number(oi.price) * oi.quantity;
        rev += amount;
        sold += oi.quantity;

        // Top products
        if (!productMap.has(oi.product_name)) {
          productMap.set(oi.product_name, { name: oi.product_name, revenue: 0, units: 0 });
        }
        const p = productMap.get(oi.product_name)!;
        p.revenue += amount;
        p.units += oi.quantity;

        // Monthly
        const date = new Date(oi.orders?.created_at || Date.now());
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(key, (monthMap.get(key) || 0) + amount);
      });

      setTotalRevenue(rev);
      setTotalSold(sold);
      setTopProducts(
        Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      );
      setMonthlyRevenue(
        Array.from(monthMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, revenue]) => ({ month, revenue }))
      );
    };

    fetchAnalytics();
  }, [user]);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Analytics</h1>
        <p className="text-muted-foreground">Track your revenue and performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Units Sold</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSold}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${totalSold > 0 ? (totalRevenue / totalSold).toFixed(2) : "0.00"}</div></CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRevenue.length === 0 ? (
            <p className="text-muted-foreground text-sm">No sales data yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">${m.revenue.toFixed(0)}</span>
                  <div
                    className="w-full bg-accent rounded-t-md transition-all"
                    style={{ height: `${(m.revenue / maxRevenue) * 160}px`, minHeight: 4 }}
                  />
                  <span className="text-xs text-muted-foreground">{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-4 w-4 text-accent" /> Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No products sold yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <span className="font-medium text-sm">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${p.revenue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{p.units} sold</p>
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
