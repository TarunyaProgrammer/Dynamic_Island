import React, { useState, useEffect } from "react";
import { Apple, ArrowUpRight } from "lucide-react";

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
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: "20px",
        left: 0,
        right: 0,
        zIndex: 90,
        display: "flex",
        justifyContent: "center",
        padding: "0 24px",
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: "clamp(12px, 3vw, 32px)",
          padding: "8px 10px 8px 16px",
          borderRadius: "var(--radius-pill)",
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.92)" : "#FFFFFF",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 8px 30px rgba(15, 17, 23, 0.08)",
          transition: "all 0.2s ease",
        }}
      >
        {/* Brand Logo & Name */}
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
              width: "30px",
              height: "30px",
              objectFit: "contain",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "17px",
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
          <a href="#simulator" style={{ color: "inherit", textDecoration: "none" }}>Dynamic Island</a>
          <a href="#gallery" style={{ color: "inherit", textDecoration: "none" }}>Surfaces</a>
          <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>6 Paradigms</a>
          <a href="#anti-slop" style={{ color: "inherit", textDecoration: "none" }}>Manifesto</a>
          <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
        </div>

        {/* Currency Switcher & Obsidian Action Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={onToggleCurrency}
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-body)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Toggle currency between USD ($) and INR (₹)"
          >
            {currency === "INR" ? "₹ INR" : "$ USD"}
          </button>

          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-obsidian"
            style={{ padding: "8px 18px", fontSize: "13px" }}
          >
            <Apple size={14} />
            <span className="desktop-only-text">Get started on macOS</span><span className="mobile-only-text" style={{ display: "none" }}>Get</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
