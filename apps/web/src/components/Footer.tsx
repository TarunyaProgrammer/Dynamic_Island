import React from "react";
import { ShieldCheck, Globe, Code2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundColor: "#050608",
        padding: "60px 0 40px 0",
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
          <div style={{ maxWidth: "340px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <img src="/logo.png" alt="Beacon" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
                Beacon
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
              The intentional Dynamic Island HUD & AI companion workspace engineered exclusively for macOS. Built for high-performance engineers, designers, and deep-work purists.
            </p>
          </div>

          {/* Links Col 1 */}
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
              Product
            </span>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <li><a href="#simulator" style={{ color: "inherit", textDecoration: "none" }}>Dynamic Island</a></li>
              <li><a href="#features" style={{ color: "inherit", textDecoration: "none" }}>6 Goal Paradigms</a></li>
              <li><a href="#spirit" style={{ color: "inherit", textDecoration: "none" }}>Spirit AI Engine</a></li>
              <li><a href="#specs" style={{ color: "inherit", textDecoration: "none" }}>Hardware Specs</a></li>
              <li><a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Lifetime License</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
              Engineering
            </span>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
              <li><span>SQLite WAL Local</span></li>
              <li><span>Apple Silicon ARM64</span></li>
              <li><span>Zero Battery Drain</span></li>
              <li><span>Apple Music & Spotify</span></li>
              <li><a href="https://beacon.tarunya.me" style={{ color: "var(--accent-solar)", textDecoration: "none" }}>beacon.tarunya.me</a></li>
            </ul>
          </div>

          {/* Links Col 3 */}
          <div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "14px" }}>
              Status & Gateway
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--accent-emerald)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-emerald)", boxShadow: "0 0 8px var(--accent-emerald)" }} />
                <span>All Systems Operational</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--accent-solar)" }}>
                <ShieldCheck size={14} />
                <span>Razorpay Checkout Active</span>
              </div>
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
          <span>© {new Date().getFullYear()} Beacon Workspace. Crafted with craft for macOS by <a href="https://tarunya.me" target="_blank" rel="noopener noreferrer" style={{ color: "#ffffff", textDecoration: "none", fontWeight: 600 }}>Tarunya Kesh</a>.</span>
          <span>Hosted on <b>beacon.tarunya.me</b></span>
        </div>
      </div>
    </footer>
  );
};
