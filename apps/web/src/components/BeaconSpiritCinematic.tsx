import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { X } from "lucide-react";

type Mood = "welcoming" | "observing" | "impressed" | "excited" | "shocked" | "relieved" | "chill";

interface SectionDialogue {
  sectionId: string;
  speech: string;
  subtext: string;
  mood: Mood;
}

export const BeaconSpiritCinematic: React.FC = () => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [temporaryReaction, setTemporaryReaction] = useState<{ speech: string; subtext: string; mood: Mood } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Periodic living eye blink
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  // Check window width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Section Dialogues (Pure Professional Copy — ZERO Emojis)
  const sectionDialogues: SectionDialogue[] = [
    {
      sectionId: "hero",
      speech: "Hi, I'm Beacon Spirit.",
      subtext: "I live inside your MacBook notch. Scroll down to explore.",
      mood: "welcoming",
    },
    {
      sectionId: "simulator",
      speech: "Dynamic Island Simulator.",
      subtext: "Hover the notch or tap +10 to test live progress synchronization.",
      mood: "excited",
    },
    {
      sectionId: "gallery",
      speech: "Crafted for Liquid Retina.",
      subtext: "Five native macOS surfaces, 0.1% CPU, and zero web wrappers.",
      mood: "impressed",
    },
    {
      sectionId: "features",
      speech: "Six Behavioral Paradigms.",
      subtext: "Track numeric quotas, timed sprints, and compounding streaks.",
      mood: "observing",
    },
    {
      sectionId: "spirit",
      speech: "Private On-Device Gemini.",
      subtext: "Schedule timers and log habits with natural language commands.",
      mood: "chill",
    },
    {
      sectionId: "specs",
      speech: "Engineered for Battery Life.",
      subtext: "45MB RAM footprint with idle background suspension.",
      mood: "impressed",
    },
    {
      sectionId: "anti-slop",
      speech: "Escape the AI Slop.",
      subtext: "Obsessive Apple-grade craft, not another bloated web wrapper.",
      mood: "chill",
    },
    {
      sectionId: "manifesto",
      speech: "Software You Own, Not Rent.",
      subtext: "One single purchase for permanent personal ownership.",
      mood: "chill",
    },
    {
      sectionId: "pricing",
      speech: "Wait... do I have to pay?",
      subtext: "Wait, $29 once for life with no monthly subscription? Take my money.",
      mood: "shocked",
    },
    {
      sectionId: "founder",
      speech: "A Promise of Craft.",
      subtext: "Built in the tradition of classic Mac utilities by Tarunya Kesharwani.",
      mood: "relieved",
    },
    {
      sectionId: "faq",
      speech: "Frequently Asked Questions.",
      subtext: "Clear answers on offline storage, privacy, and universal binaries.",
      mood: "welcoming",
    },
    {
      sectionId: "footer",
      speech: "30-Day Money-Back Guarantee.",
      subtext: "Try Beacon risk-free. See you in your MacBook notch.",
      mood: "relieved",
    },
  ];

  const [activeDialogue, setActiveDialogue] = useState<SectionDialogue>(sectionDialogues[0]);

  // 100% RELIABLE 0-LAG DOM ELEMENT SPATIAL TRACKER
  useEffect(() => {
    let animationFrameId: number | null = null;

    const evaluateSections = () => {
      const focalY = window.innerHeight * 0.45; // Exact center of user view
      let matchingSection: SectionDialogue | null = null;

      for (const item of sectionDialogues) {
        const el = document.getElementById(item.sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= focalY && rect.bottom >= focalY) {
            matchingSection = item;
            break;
          }
        }
      }

      if (matchingSection) {
        setActiveDialogue((prev) => (prev.sectionId === matchingSection!.sectionId ? prev : matchingSection!));
      }
    };

    const handleScrollOrResize = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(evaluateSections);
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    
    // Evaluate immediately and after initial render pass
    evaluateSections();
    const timeout = setTimeout(evaluateSections, 150);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      clearTimeout(timeout);
    };
  }, []);

  // Smooth Companion Motion using useScroll
  const { scrollYProgress } = useScroll();

  // Gentle, unified right-flank trajectory (NO erratic ping-ponging)
  const rawXDesktop = useTransform(
    scrollYProgress,
    [0.0, 0.2, 0.45, 0.65, 0.82, 0.92, 1.0],
    ["78vw", "75vw", "77vw", "76vw", "74vw", "72vw", "78vw"]
  );

  const rawYDesktop = useTransform(
    scrollYProgress,
    [0.0, 0.2, 0.45, 0.65, 0.82, 0.92, 1.0],
    ["20vh", "26vh", "30vh", "32vh", "28vh", "25vh", "72vh"]
  );

  // Dynamic scale morphing: Expands large in Hero and Pricing!
  const rawScaleDesktop = useTransform(
    scrollYProgress,
    [0.0, 0.15, 0.35, 0.55, 0.75, 0.88, 0.96, 1.0],
    [1.35, 1.1, 0.92, 0.92, 1.0, 1.45, 1.1, 1.0]
  );

  const rawXMobile = useTransform(scrollYProgress, [0, 1], ["62vw", "62vw"]);
  const rawYMobile = useTransform(scrollYProgress, [0, 1], ["76vh", "76vh"]);
  const rawScaleMobile = useTransform(scrollYProgress, [0, 1], [0.95, 0.95]);

  const smoothConfig = { stiffness: 50, damping: 18, mass: 0.8 };
  const smoothX = useSpring(isMobile ? rawXMobile : rawXDesktop, smoothConfig);
  const smoothY = useSpring(isMobile ? rawYMobile : rawYDesktop, smoothConfig);
  const smoothScale = useSpring(isMobile ? rawScaleMobile : rawScaleDesktop, smoothConfig);

  // Click Easter Eggs (Witty, professional — ZERO emojis)
  const easterEggs = [
    {
      speech: "Poking the mascot is against Apple HIG.",
      subtext: "Section 4.2: Mascot taps incur an artificial 0.01% CPU penalty.",
      mood: "excited" as Mood,
    },
    {
      speech: "Energy conservation engaged.",
      subtext: "Running at 0.1% idle CPU. Your MacBook battery is completely safe.",
      mood: "observing" as Mood,
    },
    {
      speech: "Permanent residency ready.",
      subtext: "One single Pioneer purchase. No monthly credit card charges forever.",
      mood: "welcoming" as Mood,
    },
    {
      speech: "14-day streak on LeetCode.",
      subtext: "Surging past 96% of software engineers this week.",
      mood: "impressed" as Mood,
    },
    {
      speech: "Global hotkey shortcut ready.",
      subtext: "Press Command-Shift-B anywhere in macOS to increment progress.",
      mood: "chill" as Mood,
    },
  ];

  const handleSpiritClick = () => {
    const nextIdx = clickCount % easterEggs.length;
    setClickCount((prev) => prev + 1);
    setTemporaryReaction(easterEggs[nextIdx]);
    setTimeout(() => {
      setTemporaryReaction(null);
    }, 4500);
  };

  if (isDismissed) return null;

  const currentSpeech = temporaryReaction ? temporaryReaction.speech : activeDialogue.speech;
  const currentSubtext = temporaryReaction ? temporaryReaction.subtext : activeDialogue.subtext;
  const currentMood = temporaryReaction ? temporaryReaction.mood : activeDialogue.mood;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: smoothX,
        y: smoothY,
        scale: smoothScale,
        zIndex: 100,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        transformOrigin: "center center",
      }}
    >
      {/* Dynamic Speech Bubble */}
      <motion.div
        key={currentSpeech}
        initial={{ opacity: 0, y: 8, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          pointerEvents: "auto",
          width: "260px",
          backgroundColor: "#FFFFFF",
          border: "1.5px solid var(--border-subtle)",
          borderRadius: "18px",
          padding: "12px 16px",
          boxShadow: "0 12px 36px rgba(15, 17, 23, 0.12), 0 2px 8px rgba(15, 17, 23, 0.05)",
          position: "relative",
          textAlign: "left",
          cursor: "pointer",
        }}
        onClick={handleSpiritClick}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "2px",
          }}
          title="Dismiss Spirit"
        >
          <X size={13} />
        </button>

        <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-ink)", display: "block", marginBottom: "3px", paddingRight: "12px", lineHeight: 1.3 }}>
          {currentSpeech}
        </span>

        {currentSubtext && (
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-body)", lineHeight: 1.45, fontWeight: 400 }}>
            {currentSubtext}
          </p>
        )}

        {/* Speech triangle */}
        <div
          style={{
            position: "absolute",
            bottom: "-6px",
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: "12px",
            height: "12px",
            backgroundColor: "#FFFFFF",
            borderRight: "1.5px solid var(--border-subtle)",
            borderBottom: "1.5px solid var(--border-subtle)",
          }}
        />
      </motion.div>

      {/* Prominent Large Living Mascot (96px × 68px) */}
      <motion.button
        type="button"
        onClick={handleSpiritClick}
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.2,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.92 }}
        style={{
          pointerEvents: "auto",
          width: "96px",
          height: "68px",
          borderRadius: "22px",
          backgroundColor: "#07080B",
          border: currentMood === "shocked"
            ? "2.5px solid #EF4444"
            : "2.5px solid rgba(217, 119, 6, 0.65)",
          boxShadow: currentMood === "shocked"
            ? "0 0 32px rgba(239, 68, 68, 0.5), 0 16px 36px rgba(0, 0, 0, 0.85)"
            : "0 0 28px rgba(217, 119, 6, 0.4), 0 14px 32px rgba(0, 0, 0, 0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          outline: "none",
          transition: "border-color 0.25s, box-shadow 0.25s",
        }}
        title="Beacon Spirit — Click to interact"
      >
        {/* Living Eyes Display */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
          {isBlinking ? (
            // Blinking (— —)
            <>
              <div style={{ width: "10px", height: "2px", backgroundColor: "#FFFFFF", borderRadius: "1px" }} />
              <div style={{ width: "10px", height: "2px", backgroundColor: "#FFFFFF", borderRadius: "1px" }} />
            </>
          ) : currentMood === "shocked" ? (
            // Comic Panic Shocked Eyes (O O) with Clean Vector SVG Teardrop
            <>
              <div style={{ width: "14px", height: "18px", borderRadius: "8px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#07080B" }} />
              </div>
              <div style={{ width: "14px", height: "18px", borderRadius: "8px", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#07080B" }} />
              </div>
              {/* Professional SVG Teardrop Icon (No Emoji) */}
              <div style={{ position: "absolute", top: "-26px", right: "-12px" }}>
                <svg width="18" height="20" viewBox="0 0 24 24" fill="#38BDF8">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
            </>
          ) : currentMood === "excited" || currentMood === "relieved" ? (
            // Cheerful Curved Eyes (^ ^)
            <>
              <span style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 900, lineHeight: 1 }}>^</span>
              <span style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 900, lineHeight: 1 }}>^</span>
            </>
          ) : (
            // Normal Alert Living Eyes (• •) with pupil glint
            <>
              <div style={{ width: "9px", height: "18px", borderRadius: "5px", backgroundColor: "#FFFFFF", position: "relative" }}>
                <div style={{ position: "absolute", top: "2px", left: "2px", width: "3px", height: "4px", backgroundColor: "#FFFFFF", borderRadius: "2px" }} />
              </div>
              <div style={{ width: "9px", height: "18px", borderRadius: "5px", backgroundColor: "#FFFFFF", position: "relative" }}>
                <div style={{ position: "absolute", top: "2px", left: "2px", width: "3px", height: "4px", backgroundColor: "#FFFFFF", borderRadius: "2px" }} />
              </div>
            </>
          )}
        </div>

        {/* Ambient Warm Underglow */}
        <div
          style={{
            position: "absolute",
            bottom: "-6px",
            width: "48px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-solar)",
            filter: "blur(5px)",
            opacity: 0.7,
          }}
        />
      </motion.button>
    </motion.div>
  );
};
