import React, { useState, useEffect } from "react";
import { NotchTab } from "../types";
import { Target, Timer, Music2, Plus, Minus, CheckCircle2, Calendar, Sparkles, Play, Pause, Volume2 } from "lucide-react";

export const IslandSimulator: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<NotchTab>("beacon");
  
  // Interactive Simulator State
  const [goalProgress, setGoalProgress] = useState(45);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60 - 42); // 24:18
  const [isFocusRunning, setIsFocusRunning] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [streakDays, setStreakDays] = useState(14);
  const [companionStatus, setCompanionStatus] = useState("Crushing goals ✨");

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

  const overallPercent = Math.min(100, Math.round((goalProgress / 100) * 100));

  return (
    <section id="simulator" style={{ position: "relative", paddingBottom: "100px" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "12px", color: "var(--accent-solar)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            LIVE INTERACTIVE HARDWARE SIMULATOR
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginTop: "8px",
            }}
          >
            Experience the MacBook Notch Come Alive
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", maxWidth: "600px", margin: "8px auto 0 auto" }}>
            Hover or tap the notch below to expand the Dynamic Island. Click tabs and increment goals in real time!
          </p>
        </div>

        {/* MacBook Screen Bezel Frame */}
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            backgroundColor: "#0d0f16",
            borderRadius: "24px 24px 8px 8px",
            border: "8px solid #1c1f2e",
            boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.12)",
            position: "relative",
            minHeight: "360px",
            backgroundImage: "radial-gradient(ellipse at 50% 120%, rgba(255, 122, 0, 0.12) 0%, transparent 65%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "0px",
          }}
        >
          {/* macOS Top Menu Bar */}
          <div
            style={{
              width: "100%",
              height: "32px",
              backgroundColor: "rgba(10, 10, 14, 0.8)",
              backdropFilter: "blur(16px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.8)",
              zIndex: 10,
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontWeight: 600 }}>
              <span style={{ fontSize: "14px" }}></span>
              <span style={{ color: "#ffffff" }}>Beacon</span>
              <span style={{ opacity: 0.6 }}>File</span>
              <span style={{ opacity: 0.6 }}>Edit</span>
              <span style={{ opacity: 0.6 }}>Focus</span>
              <span style={{ opacity: 0.6 }}>View</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "11px", fontWeight: 500 }}>
              <span style={{ color: "var(--accent-solar)" }}>⌘⇧B</span>
              <span>100% 🔋</span>
              <span>Fri Sep 4  10:24 AM</span>
            </div>
          </div>

          {/* Interactive Notch / Dynamic Island */}
          <div
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: isExpanded ? "640px" : "200px",
              height: isExpanded ? "148px" : "32px",
              backgroundColor: "#07080b",
              borderRadius: isExpanded ? "22px" : "0 0 14px 14px",
              borderTop: "none",
              borderBottom: "1px solid rgba(255, 255, 255, 0.16)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
              borderRight: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: isExpanded ? "0 24px 60px rgba(0, 0, 0, 0.9), 0 0 24px rgba(255, 122, 0, 0.2)" : "0 8px 24px rgba(0,0,0,0.6)",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: "pointer",
              overflow: "hidden",
              zIndex: 50,
              marginTop: isExpanded ? "8px" : "0px",
              display: "flex",
              flexDirection: "column",
              padding: isExpanded ? "10px 14px" : "0 12px",
            }}
          >
            {/* Collapsed Pill State */}
            {!isExpanded ? (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-solar)", boxShadow: "0 0 8px var(--accent-solar)" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff" }}>Beacon</span>
                </div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1e2230" }} title="MacBook Camera" />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-solar)" }}>{overallPercent}%</span>
              </div>
            ) : (
              /* Expanded State */
              <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "8px" }}>
                {/* Header Tabs */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveTab("beacon"); }}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: activeTab === "beacon" ? "rgba(255, 122, 0, 0.22)" : "transparent",
                        borderColor: activeTab === "beacon" ? "var(--accent-solar)" : "transparent",
                        color: activeTab === "beacon" ? "var(--accent-solar)" : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      Beacon
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveTab("focus"); }}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: activeTab === "focus" ? "rgba(56, 189, 248, 0.22)" : "transparent",
                        borderColor: activeTab === "focus" ? "var(--accent-cyan)" : "transparent",
                        color: activeTab === "focus" ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      Focus (Sprint)
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveTab("media"); }}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 700,
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: activeTab === "media" ? "rgba(192, 132, 252, 0.22)" : "transparent",
                        borderColor: activeTab === "media" ? "var(--accent-purple)" : "transparent",
                        color: activeTab === "media" ? "var(--accent-purple)" : "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      Media
                    </button>
                  </div>

                  <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.45)", fontWeight: 500 }}>
                    macOS Dynamic Island
                  </span>
                </div>

                {/* 3-Column Body Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.1fr 0.8fr", gap: "8px", flex: 1, minHeight: 0 }}>
                  {/* Column 1: Contextual Tab Card */}
                  <div
                    style={{
                      backgroundColor: "rgba(18, 20, 28, 0.95)",
                      borderRadius: "14px",
                      padding: "8px 10px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderTop: "1px solid rgba(255, 255, 255, 0.16)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {activeTab === "beacon" && (
                      <>
                        <div
                          style={{
                            width: "44px",
                            height: "36px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(255, 122, 0, 0.15)",
                            border: "1px solid rgba(255, 122, 0, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>✨</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: "3px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            Launch SaaS App
                          </span>
                          <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.65)" }}>
                            {goalProgress} / 100 problems
                          </span>
                          {/* Progress Bar */}
                          <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${goalProgress}%`, height: "100%", backgroundColor: "var(--accent-solar)", transition: "width 0.25s ease" }} />
                          </div>
                          {/* Increment Action Button */}
                          <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setGoalProgress((p) => Math.min(100, p + 10)); }}
                              style={{
                                padding: "2px 8px",
                                fontSize: "9px",
                                fontWeight: 800,
                                backgroundColor: "rgba(255, 122, 0, 0.25)",
                                border: "1px solid rgba(255, 122, 0, 0.5)",
                                color: "var(--accent-solar)",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                            >
                              +10 problems
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setGoalProgress((p) => Math.max(0, p - 10)); }}
                              style={{
                                padding: "2px 6px",
                                fontSize: "9px",
                                backgroundColor: "rgba(255, 255, 255, 0.08)",
                                border: "none",
                                color: "#ffffff",
                                borderRadius: "5px",
                                cursor: "pointer",
                              }}
                            >
                              -
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
                          <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                            {formatTimer(focusSeconds)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setIsFocusRunning(!isFocusRunning); }}
                          style={{
                            padding: "6px 12px",
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
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(192, 132, 252, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Music2 size={18} color="var(--accent-purple)" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            No Time for Caution
                          </span>
                          <span style={{ fontSize: "9px", color: "var(--accent-purple)" }}>Hans Zimmer • Spotify</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setIsPlayingMusic(!isPlayingMusic); }}
                          style={{
                            padding: "6px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(192, 132, 252, 0.2)",
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
                      backgroundColor: "rgba(18, 20, 28, 0.95)",
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
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-solar)" }}>SEP</span>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {["M", "T", "W", "T", "F"].map((d, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "2px 4px",
                              borderRadius: "4px",
                              backgroundColor: i === 4 ? "var(--accent-solar)" : "transparent",
                              color: i === 4 ? "#07080b" : "rgba(255, 255, 255, 0.4)",
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
                      <Sparkles size={10} color="var(--accent-solar)" />
                      <span>{streakDays}d streak 🔥</span>
                    </div>
                  </div>

                  {/* Column 3: Overall Ring */}
                  <div
                    style={{
                      backgroundColor: "rgba(18, 20, 28, 0.95)",
                      borderRadius: "14px",
                      padding: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderTop: "1px solid rgba(255, 255, 255, 0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "8px", color: "rgba(255, 255, 255, 0.5)" }}>Overall</span>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--accent-solar)" }}>{overallPercent}%</span>
                    </div>

                    {/* Circular SVG Ring */}
                    <svg width="34" height="34" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="var(--accent-solar)"
                        strokeWidth="3"
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

          {/* Prompt banner inside bezel */}
          <div style={{ marginTop: "auto", marginBottom: "20px", display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "100px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", color: "#ffffff" }}>
            <span>💡 Tip: Tap <b>[+10 problems]</b> inside the notch to test live progress synchronization</span>
          </div>
        </div>
      </div>
    </section>
  );
};
