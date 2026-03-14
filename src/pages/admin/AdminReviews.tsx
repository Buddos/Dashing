import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Star, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  product_id: number;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  created_at: string;
  product_name?: string;
  user_name?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const [{ data: reviewsData }, { data: products }, { data: profiles }] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id, name"),
      supabase.from("profiles").select("id, full_name"),
    ]);

    const productMap = new Map((products || []).map((p) => [p.id, p.name]));
    const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));

    setReviews(
      (reviewsData || []).map((r) => ({
        ...r,
        status: r.status || "pending",
        product_name: productMap.get(r.product_id) || "Unknown",
        user_name: profileMap.get(r.user_id) || "Unknown",
      }))
    );
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Review ${status}` });
      fetchReviews();
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review deleted" });
      fetchReviews();
    }
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-accent/10 text-accent-foreground",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.filter((r) => r.status === "pending").length} pending reviews
          </p>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No reviews found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card key={review.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{review.product_name}</p>
                      <Badge variant="outline" className={statusBadge(review.status)}>
                        {review.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        by {review.user_name} • {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium text-foreground">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-muted-foreground">{review.body}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {review.status !== "approved" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-green-600"
                        onClick={() => updateStatus(review.id, "approved")}
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {review.status !== "rejected" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => updateStatus(review.id, "rejected")}
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deleteReview(review.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
