import { LicenseReceipt, PricingPlan, RazorpaySuccessResponse } from "../types";

export const RAZORPAY_CONFIG = {
  // Configurable Razorpay Key ID - Defaults to Sandbox Test Key
  keyId: "rzp_test_BEACON_DEMO_KEY",
  currencyINR: "INR",
  currencyUSD: "USD",
};

/**
 * Generate a cryptographically styled Beacon Pioneer License Key
 */
export function generateLicenseKey(planId: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const prefix = planId === "lifetime" ? "BCN-LIFE" : "BCN-PRO";
  return `${prefix}-${segment()}-${segment()}-${segment()}`;
}

interface CheckoutParams {
  plan: PricingPlan;
  currency: "INR" | "USD";
  customerName: string;
  customerEmail: string;
  onSuccess: (receipt: LicenseReceipt) => void;
  onError: (error: string) => void;
}

export function initiateRazorpayCheckout({
  plan,
  currency,
  customerName,
  customerEmail,
  onSuccess,
  onError,
}: CheckoutParams): void {
  const amount = currency === "INR" ? plan.priceINR * 100 : plan.priceUSD * 100;
  const isSimulator = typeof window === "undefined" || !(window as any).Razorpay || RAZORPAY_CONFIG.keyId.includes("DEMO");

  if (isSimulator) {
    // Elegant built-in simulation for instant testing before live keys are added
    setTimeout(() => {
      const receipt: LicenseReceipt = {
        licenseKey: generateLicenseKey(plan.id),
        planName: plan.name,
        customerName: customerName || "Beacon Pioneer",
        customerEmail: customerEmail || "pioneer@beacon.tarunya.me",
        amountPaid: currency === "INR" ? `₹${plan.priceINR.toLocaleString()}` : `$${plan.priceUSD}`,
        paymentId: "pay_sim_" + Math.random().toString(36).substring(2, 12),
        purchaseDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      onSuccess(receipt);
    }, 800);
    return;
  }

  const options = {
    key: RAZORPAY_CONFIG.keyId,
    amount: amount,
    currency: currency,
    name: "Beacon Workspace Inc.",
    description: `${plan.name} License for macOS`,
    image: "/logo.png",
    prefill: {
      name: customerName,
      email: customerEmail,
    },
    theme: {
      color: "#ff7a00",
    },
    handler: function (response: RazorpaySuccessResponse) {
      const receipt: LicenseReceipt = {
        licenseKey: generateLicenseKey(plan.id),
        planName: plan.name,
        customerName: customerName || "Beacon Pioneer",
        customerEmail: customerEmail,
        amountPaid: currency === "INR" ? `₹${plan.priceINR.toLocaleString()}` : `$${plan.priceUSD}`,
        paymentId: response.razorpay_payment_id,
        purchaseDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      onSuccess(receipt);
    },
    modal: {
      ondismiss: function () {
        onError("Payment was cancelled. Feel free to resume anytime!");
      },
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    onError(err.message || "Failed to initialize payment gateway.");
  }
}
