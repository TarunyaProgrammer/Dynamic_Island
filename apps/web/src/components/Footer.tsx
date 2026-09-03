import React from "react";
import { ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="footer"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-canvas-subtle)",
        padding: "60px 0 40px 0",
        fontSize: "13px",
        color: "var(--text-muted)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "32px",
            marginBottom: "48px",
          }}
        >
          {/* Brand Col */}
          <div style={{ maxWidth: "340px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <img src="/logo.png" alt="Beacon" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-ink)" }}>Beacon</span>
            </div>
            <p style={{ lineHeight: 1.6, color: "var(--text-body)", fontSize: "13px" }}>
              The zero-latency Dynamic Island for your Mac. Designed and engineered for human builders, writers, and craftspeople.
            </p>
          </div>

          {/* Links Col */}
          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-ink)", display: "block", marginBottom: "12px" }}>
                Product
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><a href="#simulator" style={{ color: "var(--text-body)", textDecoration: "none" }}>Dynamic Island</a></li>
                <li><a href="#gallery" style={{ color: "var(--text-body)", textDecoration: "none" }}>macOS Surfaces</a></li>
                <li><a href="#features" style={{ color: "var(--text-body)", textDecoration: "none" }}>6 Paradigms</a></li>
                <li><a href="#pricing" style={{ color: "var(--text-body)", textDecoration: "none" }}>Pioneer Lifetime ($29)</a></li>
              </ul>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-ink)", display: "block", marginBottom: "12px" }}>
                Creator
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>
                  <a href="https://github.com/tarunyaprogrammer" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-body)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span>GitHub</span>
                    <ArrowUpRight size={11} />
                  </a>
                </li>
                <li>
                                    <a href="https://x.com/tarunyakesh" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-body)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span>X (@tarunyakesh)</span>
                    <ArrowUpRight size={11} color="var(--text-muted)" />
                  </a>
                  <a href="https://www.linkedin.com/in/tarunyakesharwani/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-body)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <span>LinkedIn</span>
                    <ArrowUpRight size={11} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
          }}
        >
          <span>© 2026 Beacon. Crafted with obsessive detail by <strong>Tarunya Kesharwani</strong>.</span>
          <span style={{ color: "var(--text-subtle)" }}>beacon.tarunya.me</span>
        </div>
      </div>
    </footer>
  );
};
