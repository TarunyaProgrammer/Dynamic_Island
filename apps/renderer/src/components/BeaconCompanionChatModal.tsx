// apps/renderer/src/components/BeaconCompanionChatModal.tsx - Interactive Spirit Companion AI Modal with Streaming Animations & Personality
import React, { useState, useEffect, useRef } from 'react';
import { BeaconCompanion } from './BeaconCompanion';
import { CompanionState } from '@shared/types';
import { Sparkles, Send, X, Loader2, CheckCircle2, Zap, Target, ArrowRight, Settings, RotateCcw } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  actionsTaken?: string[];
  timestamp: string;
  isStreaming?: boolean;
}

interface BeaconCompanionChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

const SPIRIT_EMOTES = ['✨', '🔥', '✦', '🌱', '💡', '🚀', '⚡', '🎉'];

const QUICK_ACTIONS = [
  {
    category: 'Focus',
    icon: Zap,
    color: '#ffffff',
    prompt: 'Start a 25m focus sprint on LeetCode',
    shortLabel: '25m Focus Sprint',
  },
  {
    category: 'Goals',
    icon: Target,
    color: '#ffffff',
    prompt: 'Create habit: Morning Gym 4 days a week',
    shortLabel: 'Create Gym Habit (4x/wk)',
  },
  {
    category: 'Progress',
    icon: ArrowRight,
    color: '#ffffff',
    prompt: 'I completed 2 LeetCode problems today',
    shortLabel: 'Log +2 LeetCode',
  },
  {
    category: 'Insights',
    icon: Sparkles,
    color: '#ffffff',
    prompt: 'How is my momentum rhythm this week?',
    shortLabel: 'Check Momentum Rhythm',
  },
  {
    category: 'Goals',
    icon: Target,
    color: '#ffffff',
    prompt: 'Add goal: Read 20 pages of Atomic Habits daily',
    shortLabel: 'Read 20 Pages Daily',
  },
  {
    category: 'Focus',
    icon: Zap,
    color: '#ffffff',
    prompt: 'Focus for 45 minutes on SaaS app',
    shortLabel: '45m SaaS Deep Work',
  },
  {
    category: 'Progress',
    icon: ArrowRight,
    color: '#ffffff',
    prompt: 'Log +1 to Acads',
    shortLabel: 'Log +1 Acads',
  },
  {
    category: 'Insights',
    icon: Sparkles,
    color: '#ffffff',
    prompt: 'Summarize my active goals and progress',
    shortLabel: 'Summarize Commitments',
  },
];

// Natural-pacing word-by-word streaming typewriter text component
const StreamingBubbleText: React.FC<{
  text: string;
  animate?: boolean;
  onFinish?: () => void;
  onWord?: () => void;
}> = ({ text, animate = false, onFinish, onWord }) => {
  const [displayedWords, setDisplayedWords] = useState<string[]>(() => (animate ? [] : text.split(' ')));
  const [isTyping, setIsTyping] = useState(animate);

  useEffect(() => {
    if (!animate) {
      setDisplayedWords(text.split(' '));
      setIsTyping(false);
      onFinish?.();
      return;
    }

    const words = text.split(' ');
    let currentIdx = 0;
    setDisplayedWords([]);
    setIsTyping(true);

    let timer: any;

    const streamNextWord = () => {
      if (currentIdx >= words.length) {
        setIsTyping(false);
        onFinish?.();
        return;
      }

      currentIdx += 1;
      setDisplayedWords(words.slice(0, currentIdx));
      onWord?.();

      const currentWord = words[currentIdx - 1] || '';
      // Natural speech pacing with punctuation pauses
      let delay = 38; // ~26 words per second
      if (currentWord.endsWith('.') || currentWord.endsWith('!') || currentWord.endsWith('?')) {
        delay = 135; // Natural sentence pause
      } else if (currentWord.endsWith(',') || currentWord.endsWith(';') || currentWord.endsWith(':')) {
        delay = 75; // Natural clause pause
      }

      timer = setTimeout(streamNextWord, delay);
    };

    timer = setTimeout(streamNextWord, 60);

    return () => clearTimeout(timer);
  }, [text, animate]);

  return (
    <span style={{ display: 'inline', whiteSpace: 'pre-wrap' }}>
      {displayedWords.map((word, idx) => (
        <span key={idx} className="streaming-word">
          {word}{idx < displayedWords.length - 1 ? ' ' : ''}
        </span>
      ))}
      {isTyping && <span className="spirit-cursor">✦</span>}
    </span>
  );
};

export const BeaconCompanionChatModal: React.FC<BeaconCompanionChatModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'companion',
      text: 'Hey there! I’m Beacon Spirit. I live right here in your Dynamic Island to keep your deep work burning bright. What are we conquering today? Tap a quick spell below or speak your mind! ✦',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: false,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [companionMood, setCompanionMood] = useState<CompanionState>('smiling');
  const [providerName, setProviderName] = useState<string>('AI Brain');
  const [floatingEmote, setFloatingEmote] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [streamFinishedIds, setStreamFinishedIds] = useState<Set<string>>(new Set(['welcome']));
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchConfig = async () => {
      try {
        if (window.beacon?.ai) {
          const cfg = await window.beacon.ai.getConfig();
          const p = cfg.availableProviders.find((x) => x.id === cfg.activeProvider);
          if (p) setProviderName(p.name);
        }
      } catch (err) {
        console.error('Failed to load AI provider name:', err);
      }
    };
    fetchConfig();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [isOpen]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSpiritPet = () => {
    soundEffects.playMilestonePop();
    const randomEmote = SPIRIT_EMOTES[Math.floor(Math.random() * SPIRIT_EMOTES.length)];
    setFloatingEmote(randomEmote);
    setCompanionMood('celebrating');

    setTimeout(() => {
      setFloatingEmote(null);
      setCompanionMood('smiling');
    }, 900);
  };

  const handleClearHistory = () => {
    soundEffects.playTickSound();
    setMessages([
      {
        id: `fresh-${Date.now()}`,
        sender: 'companion',
        text: 'Clean slate! What should we tackle next? ✦',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);
    setCompanionMood('thinking');
    soundEffects.playTickSound();

    try {
      if (!window.beacon?.ai) {
        throw new Error('AI bridge is initializing. Please restart Beacon or check settings.');
      }

      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }));

      const res = await window.beacon.ai.executePrompt(prompt, history);

      const companionMsg: Message = {
        id: `companion-${Date.now()}`,
        sender: 'companion',
        text: res.reply || 'On it! Updated your goals. ✦',
        actionsTaken: res.actionsTaken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, companionMsg]);
      setCompanionMood('smiling');
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'companion',
        text: `Oops! ${err.message || 'Something went sideways. Please verify your API key in settings.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
      setCompanionMood('idle');
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const visibleActions = filterCategory === 'All'
    ? QUICK_ACTIONS
    : QUICK_ACTIONS.filter((q) => q.category === filterCategory);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 6, 8, 0.78)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '540px',
          maxWidth: '92vw',
          height: '620px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-card, #0e1119)',
          borderRadius: '24px',
          borderTop: '1px solid var(--bg-card-border-top, rgba(255, 255, 255, 0.16))',
          borderBottom: '1px solid var(--border-subtle)',
          borderLeft: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg), 0 24px 64px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'entryFade 0.28s var(--ease-out)',
        }}
      >
        {/* Header with Floating Spirit Avatar & Emote */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface, rgba(14, 16, 23, 0.6))',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {/* Interactive mascot with floating bob and click effect */}
            <div
              onClick={handleSpiritPet}
              className="spirit-floating"
              style={{
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
              }}
              title="Pet the spirit! ✨"
            >
              <BeaconCompanion state={isThinking ? 'thinking' : companionMood} size="compact" interactive={false} />

              {/* Floating Emote on Click */}
              {floatingEmote && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-8px',
                    fontSize: '16px',
                    animation: 'spiritEmotePop 0.6s var(--ease-out) forwards',
                    pointerEvents: 'none',
                  }}
                >
                  {floatingEmote}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                  Beacon Spirit
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  ✦ {providerName}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {isThinking
                  ? 'Brewing action plan... 🔮'
                  : inputValue.trim()
                  ? 'Listening intently... 💭'
                  : 'Ready to crush goals ✨'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={handleClearHistory}
              className="btn-ghost"
              style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
              title="Reset Conversation"
            >
              <RotateCcw size={14} />
            </button>
            {onOpenSettings && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="btn-ghost"
                style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
                title="AI Settings"
              >
                <Settings size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
              title="Close (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Chat History Area (strictly NO horizontal scroll!) */}
        <div
          ref={chatScrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className="message-enter-anim"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  gap: '3px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isUser ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                    color: isUser ? '#000000' : 'var(--text-primary)',
                    fontWeight: isUser ? 600 : 400,
                    fontSize: '13px',
                    lineHeight: 1.45,
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <StreamingBubbleText
                    text={m.text}
                    animate={m.isStreaming && !streamFinishedIds.has(m.id)}
                    onFinish={() => {
                      setStreamFinishedIds((prev) => new Set([...prev, m.id]));
                      if (m.actionsTaken && m.actionsTaken.length > 0) {
                        setCompanionMood('celebrating');
                        soundEffects.playGoalFanfare();
                      }
                    }}
                    onWord={() => {
                      if (chatScrollRef.current) {
                        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                      }
                    }}
                  />

                  {/* Executed Tools Feedback - reveals smoothly after speech finishes */}
                  {m.actionsTaken && m.actionsTaken.length > 0 && (!m.isStreaming || streamFinishedIds.has(m.id)) && (
                    <div className="action-badge-enter" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {m.actionsTaken.map((act, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: '#ffffff',
                            border: '1px solid var(--border-subtle)',
                            wordBreak: 'break-word',
                          }}
                        >
                          <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', padding: '0 4px' }}>
                  {m.timestamp}
                </span>
              </div>
            );
          })}

          {/* Thinking Wave Indicator */}
          {isThinking && (
            <div className="message-enter-anim" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  padding: '9px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Loader2 size={13} className="animate-spin" />
                <span>Spirit is aligning your goals...</span>
              </div>
            </div>
          )}

          {/* Suggested Action Spells Section (Zero horizontal spill!) */}
          {!isThinking && (
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Quick Action Spells
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {['All', 'Goals', 'Focus', 'Progress', 'Insights'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: filterCategory === cat ? '#ffffff' : 'var(--btn-ghost-bg, rgba(255, 255, 255, 0.05))',
                        color: filterCategory === cat ? '#000000' : 'var(--text-secondary)',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flex-wrapping Pills (Guaranteed NO Horizontal Overflow) */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {visibleActions.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(act.prompt)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--bg-surface-elevated, rgba(255, 255, 255, 0.035))',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.14s ease',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 122, 0, 0.12)';
                        e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.35)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated, rgba(255, 255, 255, 0.035))';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Icon size={11} color={act.color} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {act.shortLabel}
                      </span>
                      <ArrowRight size={10} style={{ opacity: 0.5, flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface, rgba(14, 16, 23, 0.6))',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Tell Beacon what to track, edit, or focus on..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--search-bg, var(--bg-card))',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isThinking}
            style={{
              padding: '9px 16px',
              borderRadius: '12px',
              backgroundColor: inputValue.trim() && !isThinking ? '#ffffff' : 'var(--btn-ghost-bg, rgba(255, 255, 255, 0.08))',
              border: 'none',
              color: inputValue.trim() && !isThinking ? '#000000' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: inputValue.trim() && !isThinking ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {isThinking ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
