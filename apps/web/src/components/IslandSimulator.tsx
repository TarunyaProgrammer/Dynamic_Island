import React, { useState, useEffect } from "react";
import { NotchTab } from "../types";
import { 
  Sparkles, 
  Play, 
  Pause, 
  Music2, 
  Check, 
  Flame, 
  Search, 
  Command,
  Layout,
  Layers
} from "lucide-react";

type SurfaceView = "island" | "menubar" | "command";

export const IslandSimulator: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
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
    <section id="simulator" style={{ padding: "40px 0 100px 0" }}>
      <div className="container">
        {/* Dark Hardware Theater Box (Like Wispr Flow's dark section transition) */}
        <div
          style={{
            backgroundColor: "#0B0D13",
            borderRadius: "32px",
            padding: "clamp(32px, 5vw, 64px) clamp(16px, 3vw, 40px)",
            boxShadow: "0 30px 90px rgba(25, 26, 25, 0.15)",
          }}
        >
          {/* Header inside theater */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "rgba(255, 255, 255, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "12px",
              }}
            >
              PLAYABLE HARDWARE SIMULATOR
            </span>
            <h2
              className="serif-headline"
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(30px, 4.5vw, 48px)",
                marginBottom: "12px",
              }}
            >
              Touch the notch.<br />
              <span className="serif-italic" style={{ color: "rgba(255, 255, 255, 0.85)" }}>Test live progress sync.</span>
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "15px", maxWidth: "560px", margin: "0 auto" }}>
              Hover over or click the notch. Switch between the Dynamic Island, Menu Bar Popover, and Command Engine.
            </p>

            {/* Surface Mode Segmented Controls */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setSurfaceMode("island")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: surfaceMode === "island" ? "#FFFFFF" : "transparent",
                  color: surfaceMode === "island" ? "#0B0D13" : "#FFFFFF",
                  transition: "all 0.15s ease",
                }}
              >
                Dynamic Island Notch
              </button>

              <button
                type="button"
                onClick={() => setSurfaceMode("menubar")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: surfaceMode === "menubar" ? "#FFFFFF" : "transparent",
                  color: surfaceMode === "menubar" ? "#0B0D13" : "#FFFFFF",
                  transition: "all 0.15s ease",
                }}
              >
                Menu Bar Hub
              </button>

              <button
                type="button"
                onClick={() => setSurfaceMode("command")}
                style={{
                  padding: "7px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: surfaceMode === "command" ? "#FFFFFF" : "transparent",
                  color: surfaceMode === "command" ? "#0B0D13" : "#FFFFFF",
                  transition: "all 0.15s ease",
                }}
              >
                Command Engine (⌘⇧B)
              </button>
            </div>
          </div>

          {/* Virtual MacBook Screen */}
          <div
            style={{
              maxWidth: "960px",
              margin: "0 auto",
              backgroundColor: "#0d0f14",
              borderRadius: "22px 22px 10px 10px",
              border: "10px solid #1c1e28",
              borderBottom: "14px solid #1c1e28",
              boxShadow: "0 28px 80px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.12)",
              position: "relative",
              minHeight: "460px",
              backgroundImage: "url('/assets/macos-wallpaper-dark.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* macOS Menu Bar */}
            <div
              style={{
                width: "100%",
                height: "30px",
                backgroundColor: "rgba(10, 12, 18, 0.75)",
                backdropFilter: "blur(20px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.9)",
                zIndex: 30,
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontWeight: 600 }}>
                <span></span>
                <span style={{ color: "#ffffff", fontWeight: 800 }}>Beacon</span>
                <span style={{ opacity: 0.65 }}>Goals</span>
                <span style={{ opacity: 0.65 }}>Focus</span>
                <span style={{ opacity: 0.65 }}>Window</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", fontWeight: 600 }}>
                <span style={{ color: "var(--accent-solar)" }}>⌘⇧B</span>
                <span>100% 🔋</span>
                <span>Fri Sep 4  {currentTime}</span>
              </div>
            </div>

            {/* Hardware Camera Notch Cutout */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "150px",
                height: "24px",
                backgroundColor: "#07080b",
                borderRadius: "0 0 12px 12px",
                zIndex: 35,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                pointerEvents: "none",
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#151824", border: "1px solid rgba(255,255,255,0.15)" }} />
              <div style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            </div>

            {/* Dynamic Island Surface */}
            {surfaceMode === "island" && (
              <div style={{ display: "flex", justifyContent: "center", width: "100%", position: "relative", zIndex: 40 }}>
                <div
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => setIsPinned(!isPinned)}
                  style={{
                    width: isExpanded ? "660px" : "200px",
                    height: isExpanded ? "146px" : "32px",
                    backgroundColor: "#07080b",
                    borderRadius: isExpanded ? "20px" : "0 0 14px 14px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.16)",
                    borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: isExpanded ? "0 24px 60px rgba(0, 0, 0, 0.95)" : "0 8px 24px rgba(0, 0, 0, 0.6)",
                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                    cursor: "pointer",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    padding: isExpanded ? "10px 14px" : "0 14px",
                    marginTop: isExpanded ? "6px" : "0px",
                  }}
                >
                  {!isExpanded ? (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Beacon</span>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--accent-solar)" }}>{overallPercent}%</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px" }}>
                      {/* Tabs */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveTab("beacon"); }}
                            style={{
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              backgroundColor: activeTab === "beacon" ? "rgba(255, 122, 0, 0.25)" : "transparent",
                              color: activeTab === "beacon" ? "var(--accent-solar)" : "rgba(255, 255, 255, 0.55)",
                            }}
                          >
                            • Beacon
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveTab("focus"); }}
                            style={{
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              backgroundColor: activeTab === "focus" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                              color: activeTab === "focus" ? "#FFFFFF" : "rgba(255, 255, 255, 0.55)",
                            }}
                          >
                            Focus
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveTab("media"); }}
                            style={{
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              backgroundColor: activeTab === "media" ? "rgba(255, 255, 255, 0.15)" : "transparent",
                              color: activeTab === "media" ? "#FFFFFF" : "rgba(255, 255, 255, 0.55)",
                            }}
                          >
                            Media
                          </button>
                        </div>
                        <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.4)" }}>
                          {isPinned ? "Pinned 📌" : "Hover to expand"}
                        </span>
                      </div>

                      {/* 3 Columns */}
                      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1.05fr 0.8fr", gap: "8px", flex: 1, minHeight: 0 }}>
                        {/* Col 1 */}
                        <div style={{ backgroundColor: completedFlash ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 18, 26, 0.95)", borderRadius: "12px", padding: "8px 10px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {activeTab === "beacon" && (
                            <>
                              <div style={{ width: "36px", height: "30px", borderRadius: "8px", backgroundColor: "#000000", border: "1px solid rgba(255, 122, 0, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", flexShrink: 0 }}>
                                <div style={{ width: "3px", height: "6px", borderRadius: "2px", backgroundColor: "#ffffff" }} />
                                <div style={{ width: "3px", height: "6px", borderRadius: "2px", backgroundColor: "#ffffff" }} />
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: "2px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>{goalName}</span>
                                <span style={{ fontSize: "9px", color: "rgba(255, 255, 255, 0.65)" }}>{goalProgress} / 100 problems</span>
                                <div style={{ width: "100%", height: "3px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                                  <div style={{ width: `${goalProgress}%`, height: "100%", backgroundColor: "var(--accent-solar)" }} />
                                </div>
                                <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleIncrement(-10); }} style={{ padding: "1px 5px", fontSize: "9px", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "4px", cursor: "pointer" }}>-</button>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleIncrement(10); }} style={{ padding: "1px 8px", fontSize: "9px", fontWeight: 800, background: "var(--accent-solar)", border: "none", color: "#000", borderRadius: "4px", cursor: "pointer" }}>+10</button>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleComplete(); }} style={{ padding: "1px 5px", fontSize: "9px", background: "rgba(16, 185, 129, 0.3)", border: "none", color: "#10b981", borderRadius: "4px", cursor: "pointer" }}>✓</button>
                                </div>
                              </div>
                            </>
                          )}
                          {activeTab === "focus" && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                              <div>
                                <span style={{ fontSize: "10px", fontWeight: 700, color: "#ffffff", display: "block" }}>Deep Work Sprint</span>
                                <span style={{ fontSize: "17px", fontWeight: 900, color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{formatTimer(focusSeconds)}</span>
                              </div>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setIsFocusRunning(!isFocusRunning); }} style={{ padding: "4px 10px", borderRadius: "6px", backgroundColor: "rgba(56, 189, 248, 0.2)", border: "1px solid rgba(56, 189, 248, 0.4)", color: "#38bdf8", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>{isFocusRunning ? "Pause" : "Resume"}</button>
                            </div>
                          )}
                          {activeTab === "media" && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                              <Music2 size={16} color="#c084fc" />
                              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Interstellar (Day One)</span>
                                <span style={{ fontSize: "9px", color: "#c084fc" }}>Hans Zimmer • Spotify</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Col 2 */}
                        <div style={{ backgroundColor: "rgba(16, 18, 26, 0.95)", borderRadius: "12px", padding: "6px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3px", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--accent-solar)" }}>SEP 04</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "var(--accent-solar)", fontWeight: 700, fontSize: "10px" }}>
                            <Flame size={12} />
                            <span>{streakDays}d streak</span>
                          </div>
                        </div>

                        {/* Col 3 */}
                        <div style={{ backgroundColor: "rgba(16, 18, 26, 0.95)", borderRadius: "12px", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <span style={{ fontSize: "15px", fontWeight: 900, color: "var(--accent-solar)" }}>{overallPercent}%</span>
                          <svg width="32" height="32" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
                            <circle cx="16" cy="16" r="12" fill="none" stroke="var(--accent-solar)" strokeWidth="3" strokeDasharray={2 * Math.PI * 12} strokeDashoffset={2 * Math.PI * 12 * (1 - overallPercent / 100)} strokeLinecap="round" transform="rotate(-90 16 16)" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Popover / Command Engine Surfaces */}
            {surfaceMode === "menubar" && (
              <div style={{ position: "absolute", top: "34px", right: "30px", width: "320px", backgroundColor: "#0d0f16", borderRadius: "14px", padding: "14px", border: "1px solid rgba(255,255,255,0.12)", zIndex: 45, boxShadow: "0 20px 50px rgba(0,0,0,0.9)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>Beacon Hub</span>
                  <span style={{ fontSize: "11px", color: "var(--accent-solar)", fontWeight: 700 }}>Active</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {["SaaS App", "LeetCode 100", "Gym Workout"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: "12px", color: "#fff" }}>{item}</span>
                      <button type="button" onClick={() => handleIncrement(10)} style={{ padding: "2px 8px", borderRadius: "4px", backgroundColor: "var(--accent-solar)", border: "none", color: "#000", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>+10</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {surfaceMode === "command" && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "420px", backgroundColor: "#0b0d14", borderRadius: "14px", padding: "14px", border: "1px solid rgba(255,255,255,0.15)", zIndex: 45, boxShadow: "0 24px 60px rgba(0,0,0,0.9)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <Search size={14} color="rgba(255,255,255,0.5)" />
                  <input type="text" defaultValue="+10 SaaS App" style={{ background: "none", border: "none", color: "#fff", fontSize: "12px", outline: "none", width: "100%" }} />
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>esc</span>
                </div>
              </div>
            )}

            {/* macOS Dock */}
            <div style={{ marginTop: "auto", marginBottom: "12px", display: "flex", justifyContent: "center", width: "100%", zIndex: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "14px", backgroundColor: "rgba(18, 20, 28, 0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "6px", backgroundColor: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}></div>
                <div style={{ width: "26px", height: "26px", borderRadius: "6px", backgroundColor: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>🧭</div>
                <div style={{ width: "26px", height: "26px", borderRadius: "6px", backgroundColor: "#1e2230", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>&gt;_</div>
                <img src="/logo.png" alt="Beacon" style={{ width: "26px", height: "26px", borderRadius: "6px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
