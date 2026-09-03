import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { IslandSimulator } from "./components/IslandSimulator";
import { AppScreenshotsGallery } from "./components/AppScreenshotsGallery";
import { FeatureGrid } from "./components/FeatureGrid";
import { SpiritShowcase } from "./components/SpiritShowcase";
import { TechSpecs } from "./components/TechSpecs";
import { SoftwareOwnership } from "./components/SoftwareOwnership";
import { PricingSection } from "./components/PricingSection";
import { FounderLetter } from "./components/FounderLetter";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";
import { BeaconSpiritCompanion } from "./components/BeaconSpiritCompanion";
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

  const handleSelectPlan = () => {
    const plan: PricingPlan = {
      id: "lifetime",
      name: "Pioneer Lifetime License",
      tagline: "One-time purchase for lifetime personal access",
      billingPeriod: "one-time",
      ctaLabel: "Get Pioneer License",
      priceUSD: 29,
      priceINR: 2499,
      features: [
        "Lifetime personal license",
        "All 5 native macOS surfaces",
        "All 6 goal paradigms",
        "100% offline SQLite WAL",
        "Free version 1.x updates",
        "30-day money-back guarantee"
      ]
    };
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleDownloadDMG = () => {
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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-canvas)", color: "var(--text-ink)", position: "relative" }}>
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

      {/* Interactive Dynamic Island Hardware Simulator (with dark theater enclosure) */}
      <IslandSimulator />

      {/* Real macOS Screenshots on Photorealistic MacBook Retina Displays */}
      <AppScreenshotsGallery />

      {/* 6 Behavioral Goal Paradigms (Editorial Cards) */}
      <FeatureGrid />

      {/* Beacon Spirit AI Companion Showcase */}
      <SpiritShowcase />

      {/* Performance & Hardware Specs */}
      <TechSpecs />

      {/* Software Ownership Manifesto (Rental vs. Ownership) */}
      <SoftwareOwnership />

      {/* Pricing & Razorpay Trigger */}
      <PricingSection
        currency={currency}
        onSelectPlan={handleSelectPlan}
      />

      {/* Founder's Personal Letter & Craft Manifesto */}
      <FounderLetter />

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Floating Scroll-Reactive Spirit Mascot Companion */}
      <BeaconSpiritCompanion />

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
