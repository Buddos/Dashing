import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

interface OrderTrend {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

interface StatusCount {
  status: string;
  count: number;
}

const PIE_COLORS = [
  "hsl(38, 80%, 55%)",
  "hsl(20, 20%, 12%)",
  "hsl(200, 60%, 50%)",
  "hsl(150, 50%, 45%)",
  "hsl(0, 72%, 51%)",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [trends, setTrends] = useState<OrderTrend[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes, profilesRes, orderItemsRes] =
        await Promise.all([
          supabase.from("orders").select("*"),
          supabase.from("products").select("id, name"),
          supabase.from("profiles").select("id"),
          supabase.from("order_items").select("*"),
        ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const profiles = profilesRes.data || [];
      const orderItems = orderItemsRes.data || [];

      // Stats
      const totalRevenue = orders.reduce(
        (sum: number, o: any) => sum + Number(o.total || 0),
        0
      );
      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: profiles.length,
      });

      // Revenue trends (last 30 days)
      const now = new Date();
      const last30: OrderTrend[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const dayOrders = orders.filter(
          (o: any) => o.created_at?.slice(0, 10) === key
        );
        last30.push({
          date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          revenue: dayOrders.reduce(
            (s: number, o: any) => s + Number(o.total || 0),
            0
          ),
          orders: dayOrders.length,
        });
      }
      setTrends(last30);

      // Top products by revenue
      const productMap = new Map<number, { name: string; sold: number; revenue: number }>();
      orderItems.forEach((item: any) => {
        const existing = productMap.get(item.product_id);
        if (existing) {
          existing.sold += item.quantity;
          existing.revenue += Number(item.price) * item.quantity;
        } else {
          productMap.set(item.product_id, {
            name: item.product_name,
            sold: item.quantity,
            revenue: Number(item.price) * item.quantity,
          });
        }
      });
      setTopProducts(
        Array.from(productMap.values())
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      );

      // Order status breakdown
      const statusMap = new Map<string, number>();
      orders.forEach((o: any) => {
        statusMap.set(o.status, (statusMap.get(o.status) || 0) + 1);
      });
      setStatusCounts(
        Array.from(statusMap.entries()).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
        }))
      );

      // Recent orders
      setRecentOrders(
        orders
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: "+12.5%",
      up: true,
    },
    {
      label: "Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      trend: "+8.2%",
      up: true,
    },
    {
      label: "Products",
      value: stats.totalProducts,
      icon: Package,
      trend: "+3",
      up: true,
    },
    {
      label: "Customers",
      value: stats.totalUsers,
      icon: Users,
      trend: "+5.1%",
      up: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your store performance
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <TrendingUp className="h-3 w-3" />
          Last 30 days
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="border-border/50 hover:shadow-md transition-shadow"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {card.value}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs">
                {card.up ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={card.up ? "text-green-600" : "text-destructive"}>
                  {card.trend}
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "hsl(20, 10%, 45%)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(20, 10%, 45%)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(30, 20%, 98%)",
                      border: "1px solid hsl(30, 15%, 88%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(38, 80%, 55%)"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Pie */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusCounts.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusCounts}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="status"
                      paddingAngle={3}
                    >
                      {statusCounts.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(30, 20%, 98%)",
                        border: "1px solid hsl(30, 15%, 88%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center -mt-4">
                  {statusCounts.map((s, i) => (
                    <div key={s.status} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">
                        {s.status} ({s.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Top Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No sales data yet
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "hsl(20, 10%, 45%)" }}
                      tickFormatter={(v) => `$${v}`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11, fill: "hsl(20, 10%, 45%)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(30, 20%, 98%)",
                        border: "1px solid hsl(30, 15%, 88%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(38, 80%, 55%)"
                      radius={[0, 6, 6, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-foreground">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.shipping_name || "Guest"} •{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">
                        ${Number(order.total).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-accent/10 text-accent-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
