import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import ShopPage from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Wishlist from "./pages/Wishlist";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminContactInfo from "./pages/admin/AdminContactInfo";
import AdminTeam from "./pages/admin/AdminTeam";
import SellerLayout from "./components/seller/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import SellerRegister from "./pages/seller/SellerRegister";
import SellerLogin from "./pages/seller/SellerLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Admin routes – no store header/footer */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
              <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin/reviews" element={<AdminLayout><AdminReviews /></AdminLayout>} />
              <Route path="/admin/messages" element={<AdminLayout><AdminMessages /></AdminLayout>} />
              <Route path="/admin/contact-info" element={<AdminLayout><AdminContactInfo /></AdminLayout>} />
              <Route path="/admin/team" element={<AdminLayout><AdminTeam /></AdminLayout>} />

              {/* Seller routes */}
              <Route path="/seller" element={<SellerLayout><SellerDashboard /></SellerLayout>} />
              <Route path="/seller/products" element={<SellerLayout><SellerProducts /></SellerLayout>} />
              <Route path="/seller/orders" element={<SellerLayout><SellerOrders /></SellerLayout>} />
              <Route path="/seller/analytics" element={<SellerLayout><SellerAnalytics /></SellerLayout>} />

              {/* Seller auth routes (no layout) */}
              <Route path="/seller/register" element={<SellerRegister />} />
              <Route path="/seller/login" element={<SellerLogin />} />

              {/* Store routes */}
              <Route
                path="*"
                element={
                  <>
                    <Header />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/new-arrivals" element={<ShopPage />} />
                      <Route path="/deals" element={<ShopPage />} />
                      <Route path="/product/:slug" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
