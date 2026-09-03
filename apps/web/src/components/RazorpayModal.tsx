import React, { useState } from "react";
import { X, Shield, Lock, Loader2, Sparkles } from "lucide-react";
import { PricingPlan, LicenseReceipt } from "../types";
import { initiateRazorpayCheckout, generateLicenseKey } from "../services/razorpay";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const isINR = currency === "INR";
  const priceFormatted = isINR ? `₹${plan.priceINR.toLocaleString("en-IN")}` : `$${plan.priceUSD}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    initiateRazorpayCheckout({
      plan,
      currency,
      customerName: name || "Beacon Pioneer",
      customerEmail: email,
      onSuccess: (receipt) => {
        setIsLoading(false);
        onPaymentSuccess(receipt);
      },
      onError: (errMsg) => {
        setIsLoading(false);
        setError(errMsg);
      },
    });
  };

  const handleSimulateDirectSuccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const receipt: LicenseReceipt = {
        licenseKey: generateLicenseKey(plan.id),
        planName: plan.name,
        customerEmail: email || "alex@example.com",
        customerName: name || "Beacon Pioneer",
        amountPaid: priceFormatted,
        paymentId: `pay_sim_${Math.random().toString(36).substring(2, 9)}`,
        purchaseDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      onPaymentSuccess(receipt);
    }, 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#0D0F17",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "24px",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 122, 0, 0.15)",
          padding: "clamp(20px, 5vw, 32px)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          animation: "modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          color: "#FFFFFF",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#9EA5B6",
            cursor: "pointer",
            padding: "4px",
            transition: "color 0.15s",
          }}
          title="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <img src="/logo.png" alt="Beacon" style={{ width: "28px", height: "28px", borderRadius: "7px" }} />
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              Secure Checkout
            </h3>
            <span style={{ fontSize: "12px", color: "#9EA5B6" }}>
              Razorpay 256-bit Encrypted Gateway
            </span>
          </div>
        </div>

        {/* Plan Summary Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "24px",
          }}
        >
          <div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", display: "block" }}>{plan.name}</span>
            <span style={{ fontSize: "11px", color: "#9EA5B6" }}>macOS Universal License (Personal)</span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 800, color: "var(--accent-solar)" }}>
            {priceFormatted}
          </span>
        </div>

        {/* Customer Form with Explicit High Contrast Labels */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#E2E5EC", marginBottom: "6px", display: "block" }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Miller"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                color: "#FFFFFF",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#E2E5EC", marginBottom: "6px", display: "block" }}>
              Email Address (For License Key Delivery) *
            </label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                color: "#FFFFFF",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", fontSize: "12px" }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px", borderRadius: "10px", marginTop: "8px" }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Opening Gateway...</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>Pay {priceFormatted} via Razorpay</span>
              </>
            )}
          </button>
        </form>

        {/* Sandbox Test Simulator Trigger */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleSimulateDirectSuccess}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-solar)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Sparkles size={13} />
            <span>Simulate Instant Payment (Sandbox Test)</span>
          </button>
        </div>

        {/* Guarantee Footnote */}
        <div style={{ textAlign: "center", marginTop: "14px", fontSize: "11px", color: "#9EA5B6", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <Shield size={12} color="#10B981" />
          <span>30-Day Money-Back Guarantee • Instant License Generation</span>
        </div>
      </div>
    </div>
  );
};
