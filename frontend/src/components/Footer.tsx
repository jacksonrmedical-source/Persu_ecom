import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 bg-ink px-4 py-12 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
        <div>
          <h3 className="mb-3 font-display text-sm font-bold">About Us</h3>
          <ul className="space-y-2 font-body text-sm text-white/70">
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold">Customer Service</h3>
          <ul className="space-y-2 font-body text-sm text-white/70">
            <li><Link to="/returns">Returns & Exchange</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold">Quick Links</h3>
          <ul className="space-y-2 font-body text-sm text-white/70">
            <li><Link to="/collection/flash-deals">Flash Deals</Link></li>
            <li><Link to="/category/dresses">Dresses</Link></li>
            <li><Link to="/category/shoes">Shoes</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold">We Accept</h3>
          <div className="flex flex-wrap gap-2">
            {["UPI", "Visa", "Mastercard", "Razorpay"].map((method) => (
              <span
                key={method}
                className="rounded-sm border border-white/20 px-2 py-1 font-body text-[11px] font-semibold text-white/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-10 text-center font-body text-xs text-white/40">
        © 2026 Persu. All prices in INR.
      </p>
    </footer>
  );
}
