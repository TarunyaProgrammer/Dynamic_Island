import React from "react";
import { ArrowRight, Apple } from "lucide-react";

interface NavbarProps {
  currency: "INR" | "USD";
  onToggleCurrency: () => void;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currency, onToggleCurrency, onOpenPricing }) => {
  return (
    <div
      style={{
        position: "sticky",
        top: "14px",
        zIndex: 100,
        width: "100%",
        padding: "0 20px",
      }}
    >
      <header
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          borderRadius: "100px",
          boxShadow: "0 4px 20px rgba(25, 26, 25, 0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "58px",
          padding: "0 8px 0 20px",
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
              width: "26px",
              height: "26px",
              borderRadius: "6px",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-ink)",
            }}
          >
            Beacon
          </span>
        </a>

        {/* Center Navigation Links (Wispr Flow style) */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: "24px",
          }}
          className="desktop-nav"
        >
          <a href="#simulator" style={{ color: "var(--text-body)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Dynamic Island
          </a>
          <a href="#gallery" style={{ color: "var(--text-body)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Surfaces
          </a>
          <a href="#features" style={{ color: "var(--text-body)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            6 Paradigms
          </a>
          <a href="#manifesto" style={{ color: "var(--text-body)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Manifesto
          </a>
          <a href="#pricing" style={{ color: "var(--text-body)", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Pricing
          </a>
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={onToggleCurrency}
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              padding: "6px 10px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--text-body)",
            }}
          >
            {currency === "INR" ? "₹ INR" : "$ USD"}
          </button>

          {/* Wispr Flow Signature Lilac Pill Button */}
          <button
            type="button"
            onClick={onOpenPricing}
            className="btn-lilac"
            style={{ fontSize: "13px", padding: "8px 16px" }}
          >
            <Apple size={15} />
            <span>Get started on macOS</span>
          </button>
        </div>
      </header>

      <style>{`
        @media (min-width: 820px) {
          .desktop-nav {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
