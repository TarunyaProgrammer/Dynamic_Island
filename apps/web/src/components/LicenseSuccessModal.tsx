import React, { useState, useEffect } from "react";
import { LicenseReceipt } from "../types";
import { CheckCircle2, Copy, Check, Download, Sparkles, X, Apple } from "lucide-react";
import confetti from "canvas-confetti";

interface LicenseSuccessModalProps {
  receipt: LicenseReceipt | null;
  onClose: () => void;
  onDownloadDMG: () => void;
}

export const LicenseSuccessModal: React.FC<LicenseSuccessModalProps> = ({
  receipt,
  onClose,
  onDownloadDMG,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!receipt) return;

    // Trigger golden celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ff7a00", "#ffb347", "#38bdf8", "#10b981", "#ffffff"],
      });
    } catch {
      // safe fallback if canvas is restricted
    }
  }, [receipt]);

  if (!receipt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#0d0f16",
          borderRadius: "28px",
          padding: "32px",
          border: "1.5px solid var(--accent-solar)",
          boxShadow: "0 32px 100px rgba(0, 0, 0, 0.95), 0 0 40px var(--accent-solar-glow)",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* Celebration Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 122, 0, 0.2)",
            border: "1px solid rgba(255, 122, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            boxShadow: "0 0 24px var(--accent-solar-glow)",
          }}
        >
          <Sparkles size={32} color="var(--accent-solar)" />
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800, color: "#ffffff", marginBottom: "6px" }}>
          Welcome, Beacon Pioneer!
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Your payment of <b>{receipt.amountPaid}</b> was verified. A copy has been dispatched to <b>{receipt.customerEmail}</b>.
        </p>

        {/* License Key Box */}
        <div
          style={{
            backgroundColor: "rgba(18, 21, 32, 0.9)",
            borderRadius: "16px",
            padding: "16px",
            border: "1px dashed rgba(255, 122, 0, 0.4)",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-solar)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            YOUR OFFICIAL LICENSE KEY
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", backgroundColor: "#07080b", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>
              {receipt.licenseKey}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 122, 0, 0.2)",
                color: copied ? "var(--accent-emerald)" : "var(--accent-solar)",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Valid for activation on up to 3 personal MacBooks
          </span>
        </div>

        {/* Download Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button"
            onClick={onDownloadDMG}
            className="btn-solar"
            style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "12px" }}
          >
            <Download size={18} />
            <span>Download Beacon for macOS (.DMG)</span>
          </button>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Universal Binary • Compatible with Apple Silicon (M1/M2/M3/M4) & Intel
          </span>
        </div>
      </div>
    </div>
  );
};
