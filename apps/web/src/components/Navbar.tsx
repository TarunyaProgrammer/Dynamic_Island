import React, { useState } from "react";
import { Sparkles, Download, ArrowRight, ShieldCheck } from "lucide-react";

interface NavbarProps {
  currency: "INR" | "USD";
  onToggleCurrency: () => void;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currency, onToggleCurrency, onOpenPricing }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "rgba(7, 8, 11, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Brand */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src="/logo.png"
            alt="Beacon Logo"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              boxShadow: "0 0 16px rgba(255, 122, 0, 0.35)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#ffffff",
              }}
            >
              Beacon
            </span>
            <span style={{ fontSize: "10px", color: "var(--accent-solar)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              macOS Dynamic Island
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: "28px",
          }}
          className="desktop-nav"
        >
          <a href="#simulator" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            Dynamic Island
          </a>
          <a href="#features" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            6 Goal Paradigms
          </a>
          <a href="#spirit" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            Spirit AI
          </a>
          <a href="#specs" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            Architecture
          </a>
          <a href="#pricing" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            Pricing
          </a>
          <a href="#faq" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}>
            FAQ
          </a>
        </nav>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Currency Toggle */}
          <button
            type="button"
            onClick={onToggleCurrency}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Toggle between INR (₹) and USD ($)"
          >
            {currency === "INR" ? "🇮🇳 INR (₹)" : "🇺🇸 USD ($)"}
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-solar"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            <span>Get Beacon</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
