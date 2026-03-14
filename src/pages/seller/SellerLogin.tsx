import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Store } from "lucide-react";

const SellerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    // Check if user has seller role
    const { data: roleData } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "seller",
    });

    setLoading(false);

    if (!roleData) {
      toast.error("This account doesn't have seller privileges.");
      await supabase.auth.signOut();
      return;
    }

    toast.success("Welcome back, seller!");
    navigate("/seller", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Store className="h-7 w-7 text-accent-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Seller Login</h1>
          <p className="font-body text-muted-foreground">Access your seller dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="font-body text-sm font-medium">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@example.com" className="mt-1.5" />
            {errors.email && <p className="font-body text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="font-body text-sm font-medium">Password</Label>
            <div className="relative mt-1.5">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="font-body text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold uppercase tracking-wide">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="text-center font-body text-sm text-muted-foreground mt-6">
          Don't have a seller account?{" "}
          <Link to="/seller/register" className="text-accent hover:underline font-medium">Register as Seller</Link>
        </p>
      </div>
    </div>
  );
};

export default SellerLogin;
