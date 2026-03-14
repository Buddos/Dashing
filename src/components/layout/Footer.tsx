import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">DASHING</h3>
            <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
              Curated fashion and lifestyle products for the modern individual. Quality meets style.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest mb-4">Shop</h4>
            <ul className="space-y-2">
              {["New Arrivals", "Best Sellers", "Deals", "All Products"].map((item) => (
                <li key={item}>
                  <Link to="/shop" className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest mb-4">Help</h4>
            <ul className="space-y-2">
              {[
                { label: "FAQ", path: "/faq" },
                { label: "Shipping", path: "/shipping" },
                { label: "Returns", path: "/returns" },
                { label: "Contact Us", path: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: "Blog", path: "/blog" },
                { label: "Style Guide", path: "/blog" },
                { label: "Lookbook", path: "/blog" },
                { label: "Magazine", path: "/blog" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-widest mb-4">Stay Updated</h4>
            <p className="font-body text-sm text-primary-foreground/70 mb-4">Subscribe for exclusive deals and new arrivals.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-2.5 text-sm font-body text-primary-foreground placeholder:text-primary-foreground/40 rounded-l-sm focus:outline-none focus:border-accent"
              />
              <button 
                onClick={() => {
                  import("sonner").then(({ toast }) => toast.success("Subscribed successfully!"));
                }}
                className="bg-accent text-accent-foreground px-5 py-2.5 text-sm font-body font-semibold uppercase tracking-wide rounded-r-sm hover:opacity-90 transition-opacity"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-primary-foreground/50">
            © 2026 Dashing. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <Link key={item} to="/" className="font-body text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
