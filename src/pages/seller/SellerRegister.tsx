import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Store } from "lucide-react";

export default function SellerRegister() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
   const [form, setForm] = useState({ email: "", password: "", full_name: "", confirm: "", shop_description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    const { error: err } = await signUp(form.email, form.password, form.full_name, form.shop_description);
    setLoading(false);
    if (err) { setError(err.message ?? "Registration failed"); return; }
    navigate("/seller");
  };

  const f = (key: keyof typeof form, label: string, type = "text") => (
    <div key={key}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {key === "shop_description" ? (
        <textarea
          value={form[key]} 
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} 
          required
          rows={3}
          className="w-full mt-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          placeholder="Describe what you'll be selling..."
        />
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required
          className="w-full mt-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-600 items-center justify-center mb-4">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Become a Seller</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your seller account to start listing products</p>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {f("full_name", "Full Name")}
          {f("email", "Email", "email")}
          {f("shop_description", "Shop Description")}
          {f("password", "Password", "password")}
          {f("confirm", "Confirm Password", "password")}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? "Creating account…" : "Create Seller Account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/seller/login" className="text-emerald-600 hover:underline font-medium">Sign In</Link>
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          <Link to="/" className="hover:underline">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}
