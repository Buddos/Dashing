import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  isAdmin?: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const adminIds = new Set(
      (roles || []).filter((r) => r.role === "admin").map((r) => r.user_id)
    );

    setUsers(
      (profiles || []).map((p) => ({
        ...p,
        isAdmin: adminIds.has(p.id),
      }))
    );
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {users.length} registered users
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No users yet</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent-foreground font-semibold text-sm">
                  {(u.full_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    {u.full_name || "Unnamed"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {u.city && u.country
                      ? `${u.city}, ${u.country}`
                      : "No location"}
                    {" • Joined "}
                    {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>
                {u.isAdmin && (
                  <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                    Admin
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
