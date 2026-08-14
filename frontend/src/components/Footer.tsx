import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-12 bg-amber px-4 py-12 text-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-4">
        <div>
          <h3 className="mb-3 font-display text-sm font-bold text-ink">About Us</h3>
          <ul className="space-y-2 font-body text-sm text-ink/70">
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold text-ink">Customer Service</h3>
          <ul className="space-y-2 font-body text-sm text-ink/70">
            <li><Link to="/returns">Returns & Exchange</Link></li>
            <li><Link to="/shipping">Shipping Policy</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold text-ink">Quick Links</h3>
          <ul className="space-y-2 font-body text-sm text-ink/70">
            <li><Link to="/collection/flash-deals">Flash Deals</Link></li>
            <li><Link to="/category/dresses">Dresses</Link></li>
            <li><Link to="/category/shoes">Shoes</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm font-bold text-ink">We Accept</h3>
          <div className="flex flex-wrap gap-2">
            {["UPI", "Visa", "Mastercard", "Razorpay"].map((method) => (
              <span
                key={method}
                className="rounded-sm border border-ink/25 px-2 py-1 font-body text-[11px] font-semibold text-ink/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-ink/15 pt-6 sm:flex-row">
        <p className="font-body text-xs text-ink/60">
          © 2026 Persu. All prices in INR.
        </p>
        {/* Admin access lives here, deliberately separate from the customer-facing top nav */}
        <Link
          to="/admin/login"
          className="rounded-full bg-ink px-3 py-1.5 font-body text-xs font-semibold text-white"
        >
          Store Admin
        </Link>
      </div>
    </footer>
  );
}
