import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./hooks/useCart";
import { AllProductsProvider } from "./lib/allProductsContext";
import StickyTopNav from "./components/StickyTopNav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import AdminGate from "./pages/admin/AdminGate";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import StaticInfoPage from "./pages/StaticInfoPage";

export default function App() {
  return (
    <CartProvider>
      <AllProductsProvider>
        <StickyTopNav />
        <main className="min-h-[60vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/collection/:slug" element={<Category />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/account" element={<Login />} />
            <Route path="/admin/products/new" element={<AdminGate><AdminProductForm /></AdminGate>} />
            <Route path="/admin/orders" element={<AdminGate><AdminOrders /></AdminGate>} />
            <Route path="/returns" element={<StaticInfoPage title="Returns & Exchange" body="Items can be returned within 7 days of delivery, unused and with original tags. Refunds are processed within 5-7 business days of the return being received." />} />
            <Route path="/shipping" element={<StaticInfoPage title="Shipping Policy" body="Most orders dispatch within 24-48 hours and arrive within 3-7 business days depending on location. Tracking details are emailed once your order ships." />} />
            <Route path="/faqs" element={<StaticInfoPage title="FAQs" body="Common questions about sizing, payments, and delivery will be answered here. Reach out to support if you can't find what you're looking for." />} />
            <Route path="/about" element={<StaticInfoPage title="About Persu" body="Persu brings you curated fashion at honest prices — dresses, shoes, and accessories picked for everyday wear, drop by drop." />} />
            <Route path="/terms" element={<StaticInfoPage title="Terms & Conditions" body="By using Persu, you agree to our standard terms of sale, including pricing, order acceptance, and dispute resolution policies." />} />
            <Route path="/privacy" element={<StaticInfoPage title="Privacy Policy" body="We collect only what's needed to process your orders and improve your experience, and never sell your data to third parties." />} />
          </Routes>
        </main>
        <Footer />
      </AllProductsProvider>
    </CartProvider>
  );
}
