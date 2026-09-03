import React, { useState, useEffect } from "react";
import { NotchTab } from "../types";
import { 
  Sparkles, 
  Play, 
  Pause, 
  Music2, 
  Minus, 
  Check, 
  Plus, 
  Pin, 
  PinOff,
  ExternalLink,
  Flame,
  Search,
  Command,
  SlidersHorizontal
} from "lucide-react";

type SurfaceView = "island" | "menubar" | "command";

export const IslandSimulator: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true); // default pinned open so visitors see the richness immediately
  const [surfaceMode, setSurfaceMode] = useState<SurfaceView>("island");
  const [activeTab, setActiveTab] = useState<NotchTab>("beacon");

  // Interactive Goal State
  const [goalProgress, setGoalProgress] = useState(61);
  const [goalName, setGoalName] = useState("Launch SaaS App");
  const [focusSeconds, setFocusSeconds] = useState(25 * 60 - 42); // 24:18
  const [isFocusRunning, setIsFocusRunning] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [streakDays, setStreakDays] = useState(14);
  const [completedFlash, setCompletedFlash] = useState(false);
  const [currentTime, setCurrentTime] = useState("10:24 AM");

  const isExpanded = isHovered || isPinned;

  // Focus Timer Tick
  useEffect(() => {
    if (!isFocusRunning) return;
    const interval = setInterval(() => {
      setFocusSeconds((prev) => (prev > 0 ? prev - 1 : 25 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFocusRunning]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleIncrement = (amount: number) => {
    setGoalProgress((prev) => Math.min(100, Math.max(0, prev + amount)));
  };

  const handleComplete = () => {
    setGoalProgress(100);
    setCompletedFlash(true);
    setTimeout(() => setCompletedFlash(false), 1200);
  };

  const overallPercent = Math.min(100, goalProgress);

  return (
    <section id="simulator" style={{ position: "relative", paddingBottom: "100px" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "100px", backgroundColor: "rgba(255, 122, 0, 0.12)", border: "1px solid rgba(255, 122, 0, 0.3)", color: "var(--accent-solar)", fontSize: "11px", fontWeight: 700, marginBottom: "10px" }}>
            <Sparkles size={13} />
            <span>PLAYABLE HARDWARE SIMULATOR</span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            Experience Beacon Live on MacBook
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "640px", margin: "10px auto 0 auto" }}>
            Hover or interact with the hardware notch below. Switch native macOS surfaces, toggle focus sprints, and increment real metrics.
          </p>

          {/* Surface Mode Switcher Tabs */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => setSurfaceMode("island")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: surfaceMode === "island" ? "var(--accent-solar)" : "transparent",
                color: surfaceMode === "island" ? "#07080b" : "#ffffff",
                transition: "all 0.2s ease",
              }}
            >
              <span>Dynamic Island Notch</span>
            </button>

            <button
              type="button"
              onClick={() => setSurfaceMode("menubar")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: surfaceMode === "menubar" ? "var(--accent-solar)" : "transparent",
                color: surfaceMode === "menubar" ? "#07080b" : "#ffffff",
                transition: "all 0.2s ease",
              }}
            >
              <span>Menu Bar Popover Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setSurfaceMode("command")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: surfaceMode === "command" ? "var(--accent-solar)" : "transparent",
                color: surfaceMode === "command" ? "#07080b" : "#ffffff",
                transition: "all 0.2s ease",
              }}
            >
              <Command size={13} />
              <span>Command Engine (⌘⇧B)</span>
            </button>
          </div>
        </div>

        {/* MacBook Pro Display Chassis */}
        <div
          style={{
            maxWidth: "1020px",
            margin: "0 auto",
            backgroundColor: "#0d0f14",
            borderRadius: "26px 26px 12px 12px",
            border: "10px solid #1c1e28",
            borderBottom: "14px solid #1c1e28",
            boxShadow: "0 36px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.14)",
            position: "relative",
            minHeight: "480px",
            backgroundImage: "url('/assets/macos-wallpaper-dark.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* macOS Authentic Menu Bar */}
          <div
            style={{
              width: "100%",
              height: "32px",
              backgroundColor: "rgba(10, 12, 18, 0.72)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.9)",
              zIndex: 30,
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Left Menus */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontWeight: 600 }}>
              <span style={{ fontSize: "14px" }}></span>
              <span style={{ color: "#ffffff", fontWeight: 800 }}>Beacon</span>
              <span style={{ opacity: 0.65 }}>Goals</span>
              <span style={{ opacity: 0.65 }}>Focus</span>
              <span style={{ opacity: 0.65 }}>View</span>
              <span style={{ opacity: 0.65 }}>Window</span>
            </div>

            {/* Right Status Tray */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px", fontWeight: 600 }}>
              {/* Hotkey Indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-solar)", backgroundColor: "rgba(255, 122, 0, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                <span>⌘⇧B</span>
              </div>

              {/* Beacon Hub Tray Icon Trigger */}
              <button
                type="button"
                onClick={() => setSurfaceMode(surfaceMode === "menubar" ? "island" : "menubar")}
                style={{
                  background: "none",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  color: surfaceMode === "menubar" ? "var(--accent-solar)" : "#ffffff",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: surfaceMode === "menubar" ? "rgba(255, 122, 0, 0.2)" : "transparent",
                }}
                title="Click to toggle Menu Bar Popover Hub"
              >
                <img src="/logo.png" alt="Beacon Hub" style={{ width: "14px", height: "14px", borderRadius: "3px" }} />
                <span>Beacon Hub</span>
              </button>

              <span>100% 🔋</span>
              <span>Fri Sep 4  {currentTime}</span>
            </div>
          </div>

          {/* Hardware Camera Notch Cutout (Snapping from the top bezel) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "160px",
              height: "26px",
              backgroundColor: "#07080b",
              borderRadius: "0 0 14px 14px",
              zIndex: 35,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              pointerEvents: "none",
            }}
          >
            {/* Camera Lens */}
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#151824", border: "1px solid rgba(255,255,255,0.15)" }} />
            {/* Mic Indicator Green LED */}
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 4px #10b981" }} />
          </div>

          {/* ============================================================ */}
          {/* SURFACE 1: DYNAMIC ISLAND NOTCH OVERLAY                     */}
          {/* ============================================================ */}
          {surfaceMode === "island" && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                position: "relative",
                zIndex: 40,
              }}
            >
              <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsPinned(!isPinned)}
                style={{
                  width: isExpanded ? "680px" : "208px",
                  height: isExpanded ? "152px" : "34px",
                  backgroundColor: "#07080b",
                  borderRadius: isExpanded ? "22px" : "0 0 16px 16px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.16)",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: isExpanded
                    ? "0 28px 70px rgba(0, 0, 0, 0.95), 0 0 28px rgba(255, 122, 0, 0.22)"
                    : "0 8px 24px rgba(0, 0, 0, 0.6)",
                  transition: "all 0.38s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "pointer",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  padding: isExpanded ? "12px 16px" : "0 14px",
                  marginTop: isExpanded ? "6px" : "0px",
                }}
              >
                {/* Collapsed Pill State */}
                {!isExpanded ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "var(--accent-solar)", boxShadow: "0 0 8px var(--accent-solar)" }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Beacon</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent-solar)" }}>{overallPercent}%</span>
                    </div>
                  </div>
                ) : (
                  /* Expanded HUD Content */
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
                    {/* Top Row: Navigation Tabs */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveTab("beacon"); }}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "1px solid",
                            cursor: "pointer",
                            backgroundColor: activeTab === "beacon" ? "rgba(255, 122, 0, 0.22)" : "transparent",
                            borderColor: activeTab === "beacon" ? "var(--accent-solar)" : "transparent",
                            color: activeTab === "beacon" ? "var(--accent-solar)" : "rgba(255, 255, 255, 0.55)",
                          }}
                        >
                          • Beacon
                        </button>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveTab("focus"); }}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "1px solid",
                            cursor: "pointer",
                            backgroundColor: activeTab === "focus" ? "rgba(56, 189, 248, 0.22)" : "transparent",
                            borderColor: activeTab === "focus" ? "var(--accent-cyan)" : "transparent",
                            color: activeTab === "focus" ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.55)",
                          }}
                        >
                          Focus (Sprint)
                        </button>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveTab("media"); }}
                          style={{
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            border: "1px solid",
                            cursor: "pointer",
                            backgroundColor: activeTab === "media" ? "rgba(192, 132, 252, 0.22)" : "transparent",
                            borderColor: activeTab === "media" ? "var(--accent-purple)" : "transparent",
                            color: activeTab === "media" ? "var(--accent-purple)" : "rgba(255, 255, 255, 0.55)",
                          }}
                        >
                          Media
                        </button>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.4)", fontWeight: 500 }}>
                          {isPinned ? "Pinned 📌 (Click to unpin)" : "Hover to expand"}
                        </span>
                      </div>
                    </div>

                    {/* 3-Column Body Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1.05fr 0.8fr", gap: "10px", flex: 1, minHeight: 0 }}>
                      {/* Column 1: Contextual Card */}
                      <div
                        style={{
                          backgroundColor: completedFlash ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 18, 26, 0.95)",
                          borderRadius: "14px",
                          padding: "10px 12px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderTop: "1px solid rgba(255, 255, 255, 0.16)",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        {activeTab === "beacon" && (
                          <>
                            {/* Cute Spirit Avatar */}
                            <div
                              style={{
                                width: "42px",
                                height: "34px",
                                borderRadius: "10px",
                                backgroundColor: "#07080b",
                                border: "1px solid rgba(255, 122, 0, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                flexShrink: 0,
                                boxShadow: "0 0 12px rgba(255, 122, 0, 0.2)",
                              }}
                            >
                              <div style={{ width: "4px", height: "8px", borderRadius: "2px", backgroundColor: "#ffffff" }} />
                              <div style={{ width: "4px", height: "8px", borderRadius: "2px", backgroundColor: "#ffffff" }} />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: "3px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {goalName}
                              </span>
                              <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.65)" }}>
                                {goalProgress} / 100 problems
                              </span>
                              {/* Solar Amber Progress Line */}
                              <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ width: `${goalProgress}%`, height: "100%", backgroundColor: "var(--accent-solar)", transition: "width 0.25s ease" }} />
                              </div>
                              {/* Action Buttons */}
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleIncrement(-10); }}
                                  style={{
                                    padding: "2px 6px",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    border: "none",
                                    color: "#ffffff",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                  }}
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleIncrement(10); }}
                                  style={{
                                    padding: "2px 10px",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    backgroundColor: "var(--accent-solar)",
                                    border: "none",
                                    color: "#07080b",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px var(--accent-solar-glow)",
                                  }}
                                >
                                  +10 problems
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleComplete(); }}
                                  style={{
                                    padding: "2px 6px",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(16, 185, 129, 0.25)",
                                    border: "1px solid rgba(16, 185, 129, 0.5)",
                                    color: "var(--accent-emerald)",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                  }}
                                  title="Mark 100% Completed"
                                >
                                  <Check size={10} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {activeTab === "focus" && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--accent-cyan)", boxShadow: "0 0 6px var(--accent-cyan)" }} />
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Deep Work Sprint</span>
                              </div>
                              <span style={{ fontSize: "19px", fontWeight: 900, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                                {formatTimer(focusSeconds)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setIsFocusRunning(!isFocusRunning); }}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(56, 189, 248, 0.2)",
                                border: "1px solid rgba(56, 189, 248, 0.4)",
                                color: "var(--accent-cyan)",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {isFocusRunning ? "Pause" : "Resume"}
                            </button>
                          </div>
                        )}

                        {activeTab === "media" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(192, 132, 252, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Music2 size={18} color="var(--accent-purple)" />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                Interstellar (Day One)
                              </span>
                              <span style={{ fontSize: "9px", color: "var(--accent-purple)" }}>Hans Zimmer • Spotify</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setIsPlayingMusic(!isPlayingMusic); }}
                              style={{
                                padding: "6px",
                                borderRadius: "50%",
                                backgroundColor: "rgba(192, 132, 252, 0.25)",
                                border: "1px solid rgba(192, 132, 252, 0.4)",
                                color: "#ffffff",
                                cursor: "pointer",
                              }}
                            >
                              {isPlayingMusic ? <Pause size={12} /> : <Play size={12} />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Column 2: Date & Streaks */}
                      <div
                        style={{
                          backgroundColor: "rgba(16, 18, 26, 0.95)",
                          borderRadius: "14px",
                          padding: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderTop: "1px solid rgba(255, 255, 255, 0.16)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent-solar)" }}>SEP</span>
                          <div style={{ display: "flex", gap: "2px" }}>
                            {["31", "01", "02", "03", "04", "05", "06"].map((d, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: "2px 4px",
                                  borderRadius: "4px",
                                  backgroundColor: i === 4 ? "var(--accent-solar)" : "transparent",
                                  color: i === 4 ? "#07080b" : "rgba(255, 255, 255, 0.45)",
                                  fontSize: "8px",
                                  fontWeight: i === 4 ? 800 : 500,
                                }}
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--accent-solar)", fontWeight: 700, fontSize: "10px" }}>
                          <Flame size={12} color="var(--accent-solar)" />
                          <span>{streakDays}d streak 🔥</span>
                        </div>
                      </div>

                      {/* Column 3: Overall Ring */}
                      <div
                        style={{
                          backgroundColor: "rgba(16, 18, 26, 0.95)",
                          borderRadius: "14px",
                          padding: "8px 10px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderTop: "1px solid rgba(255, 255, 255, 0.16)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.5)" }}>Overall</span>
                          <span style={{ fontSize: "16px", fontWeight: 900, color: "var(--accent-solar)" }}>{overallPercent}%</span>
                        </div>

                        {/* Circular SVG Ring */}
                        <svg width="36" height="36" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3.2" />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="var(--accent-solar)"
                            strokeWidth="3.2"
                            strokeDasharray={2 * Math.PI * 14}
                            strokeDashoffset={2 * Math.PI * 14 * (1 - overallPercent / 100)}
                            strokeLinecap="round"
                            transform="rotate(-90 18 18)"
                            style={{ transition: "stroke-dashoffset 0.35s ease" }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SURFACE 2: MENU BAR POPOVER HUB ("BEACON HUB")              */}
          {/* ============================================================ */}
          {surfaceMode === "menubar" && (
            <div
              style={{
                position: "absolute",
                top: "36px",
                right: "40px",
                width: "360px",
                backgroundColor: "#0d0f16",
                borderRadius: "18px",
                padding: "16px",
                boxShadow: "0 24px 60px rgba(0,0,0,0.85), 0 0 20px rgba(255,122,0,0.2)",
                border: "1px solid rgba(255,255,255,0.12)",
                zIndex: 45,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img src="/logo.png" alt="Beacon" style={{ width: "22px", height: "22px", borderRadius: "6px" }} />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>Beacon Hub</span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--accent-solar)", fontWeight: 700 }}>13% Complete</span>
              </div>

              {/* Goal Quick Increments List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { name: "SaaS app", val: goalProgress, target: 100, inc: 10 },
                  { name: "Acads - NST", val: 1, target: 100, inc: 1 },
                  { name: "DSA-LeetCode", val: 1, target: 100, inc: 1 },
                  { name: "Gym Workout", val: 5, target: 100, inc: 1 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", display: "block" }}>{item.name}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.val} / {item.target}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleIncrement(item.inc)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(255, 122, 0, 0.2)",
                        border: "1px solid rgba(255, 122, 0, 0.4)",
                        color: "var(--accent-solar)",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      +{item.inc}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SURFACE 3: SPOTLIGHT / RAYCAST COMMAND ENGINE HUD           */}
          {/* ============================================================ */}
          {surfaceMode === "command" && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "480px",
                backgroundColor: "#0b0d14",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.9), 0 0 32px rgba(255,122,0,0.25)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                zIndex: 45,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Type to search goals, '+1 [name]' or 'new [name]'..."
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "13px",
                    outline: "none",
                  }}
                  defaultValue="+10 SaaS app"
                />
                <span style={{ fontSize: "10px", color: "var(--text-muted)", backgroundColor: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                  esc
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(255, 122, 0, 0.18)", border: "1px solid var(--accent-solar)" }}>
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>SaaS app</span>
                    <span style={{ fontSize: "10px", color: "var(--accent-solar)", marginLeft: "8px" }}>{goalProgress} / 100</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleIncrement(10)}
                    className="btn-solar"
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                  >
                    +10 ↵
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
                <span>↵ Increment • ↑↓ Select</span>
                <span>Beacon Command Engine</span>
              </div>
            </div>
          )}

          {/* Authentic macOS Dock at the bottom */}
          <div
            style={{
              marginTop: "auto",
              marginBottom: "14px",
              display: "flex",
              justifyContent: "center",
              width: "100%",
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 14px",
                borderRadius: "18px",
                backgroundColor: "rgba(18, 20, 28, 0.65)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 14px 40px rgba(0,0,0,0.6)",
              }}
            >
              {/* Mini macOS app icons */}
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }} title="Finder">
                
              </div>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }} title="Safari">
                🧭
              </div>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#1e2230", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }} title="Terminal">
                &gt;_
              </div>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }} title="Music">
                🎵
              </div>

              {/* Beacon App Icon with active running indicator dot */}
              <div style={{ position: "relative" }}>
                <img
                  src="/logo.png"
                  alt="Beacon"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    boxShadow: "0 0 12px var(--accent-solar-glow)",
                  }}
                  title="Beacon"
                />
                <div style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "var(--accent-solar)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
