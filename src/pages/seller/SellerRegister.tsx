import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Store } from "lucide-react";

const SellerRegister = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Must be at least 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), is_seller: true },
        emailRedirectTo: window.location.origin + "/seller/login",
      },
    });

    if (signUpError) {
      setLoading(false);
      toast.error(signUpError.message);
      return;
    }

    // If user was created and confirmed (or auto-confirmed), assign seller role
    if (signUpData.user) {
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: signUpData.user.id,
        role: "seller" as any,
      });
      if (roleError) {
        console.error("Role assignment error:", roleError);
      }
    }

    setLoading(false);
    toast.success("Seller account created! Check your email to confirm, then log in.");
    navigate("/seller/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <Store className="h-7 w-7 text-accent-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Become a Seller</h1>
          <p className="font-body text-muted-foreground">
            Start selling on DASHING and grow your business
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="fullName" className="font-body text-sm font-medium">Full Name / Business Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name or business" className="mt-1.5" />
            {errors.fullName && <p className="font-body text-xs text-destructive mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="font-body text-sm font-medium">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@example.com" className="mt-1.5" />
            {errors.email && <p className="font-body text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="font-body text-sm font-medium">Password</Label>
            <div className="relative mt-1.5">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="font-body text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="font-body text-sm font-medium">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="mt-1.5" />
            {errors.confirmPassword && <p className="font-body text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold uppercase tracking-wide">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Seller Account"}
          </Button>
        </form>

        <p className="text-center font-body text-sm text-muted-foreground mt-6">
          Already have a seller account?{" "}
          <Link to="/seller/login" className="text-accent hover:underline font-medium">Sign In</Link>
        </p>
        <p className="text-center font-body text-sm text-muted-foreground mt-2">
          Looking to shop?{" "}
          <Link to="/register" className="text-accent hover:underline font-medium">Create a customer account</Link>
        </p>
      </div>
    </div>
  );
};

export default SellerRegister;
