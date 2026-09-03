import React, { useState, useEffect } from "react";
import { CheckCircle, Copy, Check, Download, Sparkles, X, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import { LicenseReceipt } from "../types";

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
    if (receipt) {
      // Confetti Explosion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff7a00", "#10b981", "#38bdf8", "#ffffff"],
        });
      } catch {
        // Safe fallback
      }
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 210,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#0E1017",
          border: "1px solid rgba(255, 122, 0, 0.4)",
          borderRadius: "24px",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(255, 122, 0, 0.2)",
          padding: "clamp(20px, 5vw, 36px)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          textAlign: "center",
          color: "#FFFFFF",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#9EA5B6", cursor: "pointer", padding: "4px" }}
          title="Close modal"
        >
          <X size={20} />
        </button>

        {/* Success Icon */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px auto",
            boxShadow: "0 0 24px rgba(16, 185, 129, 0.3)",
          }}
        >
          <CheckCircle size={30} color="#10B981" />
        </div>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            marginBottom: "8px",
          }}
        >
          Welcome to Beacon, Pioneer!
        </h3>
        <p style={{ fontSize: "14px", color: "#CBD1DE", marginBottom: "24px", lineHeight: 1.5 }}>
          Your payment of <strong>{receipt.amountPaid}</strong> was successful. Your lifetime personal license has been registered.
        </p>

        {/* License Key Box */}
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 122, 0, 0.4)",
            padding: "16px",
            marginBottom: "24px",
            position: "relative",
          }}
        >
          <span style={{ fontSize: "10px", color: "var(--accent-solar)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, display: "block", marginBottom: "6px" }}>
            YOUR PERSONAL LICENSE KEY
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.05em" }}>
              {receipt.licenseKey}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.08)",
                border: "1px solid",
                borderColor: copied ? "#10b981" : "rgba(255, 255, 255, 0.15)",
                color: copied ? "#10b981" : "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.15s ease",
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button"
            onClick={onDownloadDMG}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "10px" }}
          >
            <Download size={16} />
            <span>Download Beacon for macOS (Universal)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ width: "100%", padding: "12px", fontSize: "14px", borderRadius: "10px" }}
          >
            Done
          </button>
        </div>

        {/* Footnote */}
        <div style={{ marginTop: "16px", fontSize: "11px", color: "#9EA5B6" }}>
          A confirmation receipt and license key has also been emailed to <strong>{receipt.customerEmail}</strong>.
        </div>
      </div>
    </div>
  );
};
