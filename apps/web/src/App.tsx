import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { IslandSimulator } from "./components/IslandSimulator";
import { AppScreenshotsGallery } from "./components/AppScreenshotsGallery";
import { FeatureGrid } from "./components/FeatureGrid";
import { SpiritShowcase } from "./components/SpiritShowcase";
import { TechSpecs } from "./components/TechSpecs";
import { PricingSection } from "./components/PricingSection";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import { RazorpayModal } from "./components/RazorpayModal";
import { LicenseSuccessModal } from "./components/LicenseSuccessModal";
import { PricingPlan, LicenseReceipt } from "./types";

export const App: React.FC = () => {
  const [currency, setCurrency] = useState<"INR" | "USD">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("beacon_currency") as "INR" | "USD") || "USD";
    }
    return "USD";
  });

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<LicenseReceipt | null>(null);

  const toggleCurrency = () => {
    const next = currency === "INR" ? "USD" : "INR";
    setCurrency(next);
    localStorage.setItem("beacon_currency", next);
  };

  const handleOpenPricing = () => {
    const pricingEl = document.getElementById("pricing");
    if (pricingEl) {
      pricingEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleDownloadDMG = () => {
    // Generate simulated download anchor for macOS dmg
    const a = document.createElement("a");
    a.href = "#";
    a.download = "Beacon-1.0.0-mac-universal.dmg";
    document.body.appendChild(a);
    alert("Beacon 1.0 Universal DMG download initiated! (Apple Silicon M1/M2/M3/M4 & Intel)");
    document.body.removeChild(a);
  };

  const handlePaymentSuccess = (receipt: LicenseReceipt) => {
    setIsCheckoutOpen(false);
    setSuccessReceipt(receipt);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-black)", color: "var(--text-primary)", position: "relative" }}>
      {/* Navigation */}
      <Navbar
        currency={currency}
        onToggleCurrency={toggleCurrency}
        onOpenPricing={handleOpenPricing}
      />

      {/* Hero */}
      <HeroSection
        onOpenPricing={handleOpenPricing}
        onDownloadTrial={handleDownloadDMG}
        currency={currency}
      />

      {/* Interactive Dynamic Island Hardware Simulator */}
      <IslandSimulator />

      {/* Real macOS Screenshots Gallery */}
      <AppScreenshotsGallery />

      {/* 6 Behavioral Goal Paradigms & OS Integration */}
      <FeatureGrid />

      {/* Beacon Spirit AI Companion Showcase */}
      <SpiritShowcase />

      {/* Performance & Hardware Specs */}
      <TechSpecs />

      {/* Pricing & Razorpay Trigger */}
      <PricingSection
        currency={currency}
        onSelectPlan={handleSelectPlan}
        onDownloadTrial={handleDownloadDMG}
      />

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Razorpay Checkout Modal */}
      <RazorpayModal
        isOpen={isCheckoutOpen}
        plan={selectedPlan}
        currency={currency}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* License Success & Confetti Delivery Modal */}
      <LicenseSuccessModal
        receipt={successReceipt}
        onClose={() => setSuccessReceipt(null)}
        onDownloadDMG={handleDownloadDMG}
      />
    </div>
  );
};
