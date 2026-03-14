import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Deals", to: "/deals" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Become a Seller", to: "/seller/register" },
];

const Header = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-body tracking-widest uppercase">
        Free shipping on orders over KES 100 — <Link to="/deals" className="underline underline-offset-2">Shop Deals</Link>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Dashing Logo" width="200" className="h-12 md:h-16 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-sm font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-muted rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none w-32 lg:w-48 font-body"
              />
              <button type="submit" className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                <Search size={18} />
              </button>
            </form>

            {/* Mobile Search Toggle */}
            <button
              className="md:hidden p-2 text-foreground hover:text-accent transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link to="/wishlist" className="p-2 text-foreground hover:text-accent transition-colors" aria-label="Wishlist">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="p-2 text-foreground hover:text-accent transition-colors relative" aria-label="Cart">
              <ShoppingBag size={20} />
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </Link>
            {user ? (
              <button onClick={signOut} className="hidden md:flex p-2 text-foreground hover:text-accent transition-colors" aria-label="Sign out">
                <LogOut size={20} />
              </button>
            ) : (
              <Link to="/login" className="hidden md:flex p-2 text-foreground hover:text-accent transition-colors" aria-label="Account">
                <User size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-muted rounded-full px-4 py-2 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none font-body"
              autoFocus
            />
            <button type="submit" className="p-2 text-foreground hover:text-accent transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-body text-sm font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="font-body text-sm font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground py-2 text-left"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="font-body text-sm font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
                Account
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
