export type NotchTab = "beacon" | "focus" | "media";

export interface PricingPlan {
  id: "lifetime" | "annual" | "team";
  name: string;
  tagline: string;
  priceUSD: number;
  priceINR: number;
  billingPeriod: string;
  badge?: string;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface LicenseReceipt {
  licenseKey: string;
  planName: string;
  customerEmail: string;
  customerName: string;
  amountPaid: string;
  paymentId: string;
  purchaseDate: string;
}
