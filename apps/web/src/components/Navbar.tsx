import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface NavbarProps {
  currency: "INR" | "USD";
  onToggleCurrency: () => void;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currency, onToggleCurrency, onOpenPricing }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "sticky",
        top: "16px",
        zIndex: 100,
        width: "100%",
        padding: "0 20px",
        pointerEvents: "none",
      }}
    >
      <header
        style={{
          maxWidth: "1060px",
          margin: "0 auto",
          backgroundColor: scrolled ? "rgba(7, 8, 12, 0.88)" : "rgba(10, 12, 18, 0.72)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderTop: "1px solid rgba(255, 255, 255, 0.22)",
          borderRadius: "100px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.75), 0 0 20px rgba(255, 122, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          padding: "0 8px 0 18px",
          pointerEvents: "auto",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Brand */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src="/logo.png"
            alt="Beacon"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              filter: "drop-shadow(0 0 10px rgba(255, 122, 0, 0.45))",
            }}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "17px",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#ffffff",
              }}
            >
              Beacon
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--accent-solar)",
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: "rgba(255, 122, 0, 0.14)",
                border: "1px solid rgba(255, 122, 0, 0.25)",
              }}
            >
              macOS
            </span>
          </div>
        </a>

        {/* Center Desktop Links */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: "24px",
          }}
          className="desktop-nav"
        >
          <a href="#simulator" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            Dynamic Island
          </a>
          <a href="#gallery" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            App Surfaces
          </a>
          <a href="#features" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            6 Paradigms
          </a>
          <a href="#spirit" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            Spirit AI
          </a>
          <a href="#pricing" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            Pricing
          </a>
          <a href="#faq" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.01em", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Currency Toggle */}
          <button
            type="button"
            onClick={onToggleCurrency}
            style={{
              padding: "5px 10px",
              borderRadius: "100px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Toggle between INR (₹) and USD ($)"
          >
            {currency === "INR" ? "🇮🇳 INR (₹)" : "🇺🇸 USD ($)"}
          </button>

          {/* Nested CTA Button */}
          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-pill-solar"
            style={{ fontSize: "12px", padding: "6px 8px 6px 16px" }}
          >
            <span>Get Beacon</span>
            <div className="btn-icon-bubble" style={{ width: "24px", height: "24px" }}>
              <ArrowRight size={13} color="#06070a" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </header>

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
