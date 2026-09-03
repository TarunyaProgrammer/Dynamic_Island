import React, { useState, useEffect } from "react";
import { Sparkles, MessageCircle, X } from "lucide-react";

export const BeaconSpiritCompanion: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<string>("hero");
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(true);
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  // Periodic Eye Blink
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Track active scroll section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;

      if (scrollY < height * 0.7) {
        setCurrentSection("hero");
      } else if (scrollY < height * 1.8) {
        setCurrentSection("simulator");
      } else if (scrollY < height * 2.8) {
        setCurrentSection("gallery");
      } else if (scrollY < height * 3.8) {
        setCurrentSection("features");
      } else if (scrollY < height * 4.8) {
        setCurrentSection("manifesto");
      } else {
        setCurrentSection("pricing");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Speech bubble content mapped to scroll position
  const getSectionDialogue = () => {
    if (customMessage) return customMessage;
    switch (currentSection) {
      case "hero":
        return "Hey! I live in your MacBook notch. Touch the notch below to test me out! 🍎";
      case "simulator":
        return "Try clicking [+10] or hover the notch to test live progress sync! ⚡";
      case "gallery":
        return "5 native macOS surfaces, 0.1% CPU, and zero web wrappers. Pure hardware craft.";
      case "features":
        return "Checkboxes are boring. We built 6 psychological models for real ambitious humans. 🔥";
      case "manifesto":
        return "Software you own forever! Down with $15/mo subscriptions. 💎";
      case "pricing":
        return "30-day unconditional refund guarantee. Try Beacon completely risk-free! 🤝";
      default:
        return "Ready to take control of your daily focus?";
    }
  };

  const handleSpiritClick = () => {
    setIsHappy(true);
    const cheerings = [
      "Let's crush today's deep work goals! 🚀",
      "Focus is a muscle. You're building it right now! ✨",
      "I'm keeping your notch warm and waiting for you! 🍎",
      "Zero subscriptions forever. You own me! 💎",
      "14 days and counting — keep that streak alive! 🔥"
    ];
    const randomMsg = cheerings[Math.floor(Math.random() * cheerings.length)];
    setCustomMessage(randomMsg);
    setTimeout(() => {
      setIsHappy(false);
      setCustomMessage(null);
    }, 4000);
  };

  return (
    <div
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 99,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {/* Dynamic Reactive Speech Bubble */}
      {isBubbleVisible && (
        <div
          style={{
            maxWidth: "260px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px 16px 4px 16px",
            padding: "12px 16px",
            boxShadow: "0 8px 30px rgba(25, 26, 25, 0.12)",
            fontSize: "12px",
            lineHeight: 1.5,
            color: "var(--text-ink)",
            pointerEvents: "auto",
            position: "relative",
            animation: "fade-in 0.3s ease",
            transformOrigin: "bottom right",
          }}
        >
          <button
            type="button"
            onClick={() => setIsBubbleVisible(false)}
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "2px",
            }}
            title="Dismiss speech bubble"
          >
            <X size={12} />
          </button>
          <p style={{ margin: 0, paddingRight: "10px", fontWeight: 500 }}>
            {getSectionDialogue()}
          </p>
        </div>
      )}

      {/* Living Spirit Mascot Avatar */}
      <button
        type="button"
        onClick={handleSpiritClick}
        style={{
          width: "52px",
          height: "44px",
          borderRadius: "14px",
          backgroundColor: "#07080B",
          border: "2px solid rgba(255, 122, 0, 0.4)",
          boxShadow: isHappy
            ? "0 0 24px rgba(255, 122, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.8)"
            : "0 0 16px rgba(255, 122, 0, 0.25), 0 8px 20px rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          cursor: "pointer",
          pointerEvents: "auto",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isHappy ? "scale(1.1) translateY(-4px)" : "translateY(0)",
        }}
        title="Click me to chat with Beacon Spirit!"
      >
        {/* Living Eyes */}
        {isHappy ? (
          <>
            <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: 900, lineHeight: 1 }}>^</span>
            <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: 900, lineHeight: 1 }}>^</span>
          </>
        ) : isBlinking ? (
          <>
            <div style={{ width: "5px", height: "1px", backgroundColor: "#FFFFFF" }} />
            <div style={{ width: "5px", height: "1px", backgroundColor: "#FFFFFF" }} />
          </>
        ) : (
          <>
            <div style={{ width: "5px", height: "9px", borderRadius: "3px", backgroundColor: "#FFFFFF" }} />
            <div style={{ width: "5px", height: "9px", borderRadius: "3px", backgroundColor: "#FFFFFF" }} />
          </>
        )}
      </button>
    </div>
  );
};
