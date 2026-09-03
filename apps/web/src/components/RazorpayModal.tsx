import React, { useState } from "react";
import { PricingPlan, LicenseReceipt } from "../types";
import { initiateRazorpayCheckout, RAZORPAY_CONFIG } from "../services/razorpay";
import { X, ShieldCheck, Lock, CreditCard, Sparkles, Loader2 } from "lucide-react";

interface RazorpayModalProps {
  isOpen: boolean;
  plan: PricingPlan | null;
  currency: "INR" | "USD";
  onClose: () => void;
  onPaymentSuccess: (receipt: LicenseReceipt) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  plan,
  currency,
  onClose,
  onPaymentSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useLiveRazorpay, setUseLiveRazorpay] = useState(false);

  if (!isOpen || !plan) return null;

  const priceFormatted = currency === "INR" ? `₹${plan.priceINR.toLocaleString()}` : `$${plan.priceUSD}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address for license key delivery.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // If testing without live Razorpay keys, run instant simulated checkout
    if (!useLiveRazorpay) {
      setTimeout(() => {
        initiateRazorpayCheckout({
          plan,
          currency,
          customerName: name || "Beacon Pioneer",
          customerEmail: email,
          onSuccess: (receipt) => {
            setIsProcessing(false);
            onPaymentSuccess(receipt);
          },
          onError: (err) => {
            setIsProcessing(false);
            setErrorMessage(err);
          },
        });
      }, 600);
      return;
    }

    // Otherwise invoke Razorpay SDK
    initiateRazorpayCheckout({
      plan,
      currency,
      customerName: name || "Beacon Pioneer",
      customerEmail: email,
      onSuccess: (receipt) => {
        setIsProcessing(false);
        onPaymentSuccess(receipt);
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMessage(err);
      },
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
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
          maxWidth: "460px",
          backgroundColor: "#0d0f16",
          borderRadius: "24px",
          padding: "28px",
          border: "1px solid rgba(255, 122, 0, 0.25)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.95), 0 0 32px var(--accent-solar-glow)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(255, 122, 0, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={18} color="var(--accent-solar)" />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff" }}>Secure Checkout</h3>
              <span style={{ fontSize: "11px", color: "var(--accent-solar)", fontWeight: 600 }}>Razorpay 256-Bit Gateway</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan Summary Pill */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "14px",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", display: "block" }}>{plan.name}</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>macOS Universal License (Up to 3 Macs)</span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 800, color: "var(--accent-solar)" }}>
            {priceFormatted}
          </span>
        </div>

        {/* Customer Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Miller"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
              Email Address (For License Delivery) *
            </label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Test Sandbox Simulator Switcher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "10px",
              backgroundColor: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              fontSize: "11px",
              color: "var(--accent-cyan)",
            }}
          >
            <span>💡 Mode: Instant Sandbox Simulator</span>
            <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "rgba(56,189,248,0.2)", padding: "2px 6px", borderRadius: "4px" }}>
              TEST READY
            </span>
          </div>

          {errorMessage && (
            <div style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", fontSize: "12px" }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="btn-solar"
            style={{ width: "100%", padding: "14px", fontSize: "14px", marginTop: "6px" }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Opening Gateway...</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>Pay {priceFormatted} & Generate License</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "10px", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <ShieldCheck size={12} color="var(--accent-emerald)" />
          <span>Cards, UPI, NetBanking, Apple Pay supported via Razorpay</span>
        </div>
      </div>
    </div>
  );
};
