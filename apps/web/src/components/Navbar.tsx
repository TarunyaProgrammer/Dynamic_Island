import React, { useState, useEffect } from "react";
import { Apple } from "lucide-react";

interface NavbarProps {
  currency: "INR" | "USD";
  onToggleCurrency: () => void;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onToggleCurrency,
  onOpenPricing,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pricePill = currency === "INR" ? "₹2,499" : "$29";

  return (
    <header
      style={{
        position: "fixed",
        top: "14px",
        left: 0,
        right: 0,
        zIndex: 90,
        display: "flex",
        justifyContent: "center",
        padding: "0 14px",
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: "clamp(8px, 2.5vw, 28px)",
          padding: "6px 8px 6px 14px",
          borderRadius: "var(--radius-pill)",
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.94)" : "#FFFFFF",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 8px 30px rgba(15, 17, 23, 0.08)",
          transition: "all 0.2s ease",
          maxWidth: "100%",
        }}
      >
        {/* Brand Logo & Name */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "inherit",
            flexShrink: 0,
          }}
        >
          <img
            src="/logo.png"
            alt="Beacon"
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "16px",
              fontWeight: 800,
              color: "var(--text-ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Beacon
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-body)",
          }}
          className="nav-links-desktop"
        >
          <a href="#simulator" style={{ color: "inherit", textDecoration: "none" }}>Simulator</a>
          <a href="#gallery" style={{ color: "inherit", textDecoration: "none" }}>Surfaces</a>
          <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>6 Paradigms</a>
          <a href="#anti-slop" style={{ color: "inherit", textDecoration: "none" }}>Manifesto</a>
          <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
        </div>

        {/* Currency Switcher & Obsidian Action Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={onToggleCurrency}
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)",
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-body)",
              cursor: "pointer",
            }}
            title="Toggle currency"
          >
            {currency === "INR" ? "₹" : "$"}
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-obsidian navbar-cta-btn"
            style={{ padding: "7px 14px", fontSize: "12px" }}
          >
            <Apple size={13} />
            <span className="navbar-cta-desktop">Get started on macOS</span>
            <span className="navbar-cta-mobile">{pricePill}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
