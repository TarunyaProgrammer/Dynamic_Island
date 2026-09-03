import React from "react";
import { ShieldCheck, Globe, Code2, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundColor: "#050608",
        padding: "64px 0 40px 0",
        position: "relative",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "36px",
            marginBottom: "48px",
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: "360px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <img src="/logo.png" alt="Beacon Logo" style={{ width: "36px", height: "36px", borderRadius: "10px", boxShadow: "0 0 16px rgba(255, 122, 0, 0.35)" }} />
              <div>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 800, color: "#ffffff", display: "block", lineHeight: 1.1 }}>
                  Beacon
                </span>
                <span style={{ fontSize: "10px", color: "var(--accent-solar)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  macOS Dynamic Island
                </span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "16px" }}>
              The intentional Dynamic Island HUD & AI companion workspace engineered exclusively for macOS. Built for high-performance engineers, founders, and deep-work purists.
            </p>
            {/* Creator Attribution */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Created by</span>
              <a
                href="https://github.com/tarunyaprogrammer"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-solar)", textDecoration: "none" }}
              >
                Tarunya Kesharwani
              </a>
            </div>
          </div>

          {/* Links Col 1: Product */}
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
              Product
            </span>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <li><a href="#simulator" style={{ color: "inherit", textDecoration: "none" }}>Dynamic Island</a></li>
              <li><a href="#gallery" style={{ color: "inherit", textDecoration: "none" }}>macOS Surfaces</a></li>
              <li><a href="#features" style={{ color: "inherit", textDecoration: "none" }}>6 Goal Paradigms</a></li>
              <li><a href="#spirit" style={{ color: "inherit", textDecoration: "none" }}>Spirit AI Engine</a></li>
              <li><a href="#specs" style={{ color: "inherit", textDecoration: "none" }}>Hardware Specs</a></li>
              <li><a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pioneer Lifetime Deal</a></li>
            </ul>
          </div>

          {/* Links Col 2: Connect with Creator */}
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
              Connect & Developer
            </span>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <li>
                <a
                  href="https://github.com/tarunyaprogrammer"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#ffffff", textDecoration: "none", fontWeight: 500 }}
                >
                  <Code2 size={14} color="var(--accent-solar)" />
                  <span>GitHub (@tarunyaprogrammer)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/tarunyakesharwani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#ffffff", textDecoration: "none", fontWeight: 500 }}
                >
                  <Globe size={14} color="var(--accent-cyan)" />
                  <span>LinkedIn (Tarunya Kesharwani)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://beacon.tarunya.me"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-solar)", textDecoration: "none", fontWeight: 600 }}
                >
                  <Sparkles size={14} />
                  <span>beacon.tarunya.me</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Links Col 3: Status & Gateway */}
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
              Gateway & Security
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--accent-emerald)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-emerald)", boxShadow: "0 0 8px var(--accent-emerald)" }} />
                <span>All Systems Operational</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--accent-solar)" }}>
                <ShieldCheck size={14} />
                <span>Razorpay 256-Bit SSL Checkout</span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Cards • UPI • NetBanking • Apple Pay
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          <span>
            © {new Date().getFullYear()} Beacon Workspace Inc. Architected with craft for macOS by{" "}
            <a
              href="https://www.linkedin.com/in/tarunyakesharwani/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ffffff", textDecoration: "none", fontWeight: 600 }}
            >
              Tarunya Kesharwani
            </a>
            .
          </span>
          <span>
            Target Domain: <a href="https://beacon.tarunya.me" style={{ color: "var(--accent-solar)", textDecoration: "none", fontWeight: 600 }}>beacon.tarunya.me</a>
          </span>
        </div>
      </div>
    </footer>
  );
};
