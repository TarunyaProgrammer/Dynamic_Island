import React, { useState, useEffect, useRef } from 'react';
import { BeaconCompanion } from './BeaconCompanion';
import { CompanionState } from '@shared/types';
import { Sparkles, Send, X, Loader2, CheckCircle2, Zap, Target, ArrowRight, Settings } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  actionsTaken?: string[];
  timestamp: string;
}

interface BeaconCompanionChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

const PRE_GENERATED_ACTIONS = [
  {
    category: 'Create Goals',
    icon: Target,
    color: '#ff7a00',
    prompts: [
      'Create habit: Morning Gym 4 days a week',
      'Add goal: Read 20 pages of Atomic Habits daily',
      'Set deadline: SaaS Product Launch by Oct 31',
    ],
  },
  {
    category: 'Deep Work & Focus',
    icon: Zap,
    color: '#38bdf8',
    prompts: [
      'Start a 25m focus sprint on LeetCode',
      'Focus for 45 minutes on SaaS app',
    ],
  },
  {
    category: 'Log Progress & Edits',
    icon: ArrowRight,
    color: '#10b981',
    prompts: [
      'I completed 2 LeetCode problems today',
      'Log +1 to Acads',
      'Increase my Gym target to 5 days a week',
    ],
  },
  {
    category: 'Insights & Review',
    icon: Sparkles,
    color: '#a855f7',
    prompts: [
      'How is my momentum rhythm this week?',
      'Summarize my active goals and progress',
    ],
  },
];

export const BeaconCompanionChatModal: React.FC<BeaconCompanionChatModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'companion',
      text: 'Hi there! I’m your Beacon companion spirit. ✨ What would you like to build, track, or focus on today? You can choose one of the suggestions below or type any command.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [companionMood, setCompanionMood] = useState<CompanionState>('smiling');
  const [providerName, setProviderName] = useState<string>('AI Brain');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch active provider name
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

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);
    setCompanionMood('thinking');
    soundEffects.playTickSound();

    try {
      if (!window.beacon?.ai) {
        throw new Error('AI engine is currently initializing. Please check settings.');
      }

      // Format conversation history for multi-turn orchestrator
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
        text: res.reply || 'All done! I updated your goals. ✦',
        actionsTaken: res.actionsTaken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, companionMsg]);
      setCompanionMood(res.actionsTaken.length > 0 ? 'celebrating' : 'smiling');
      if (res.actionsTaken.length > 0) {
        soundEffects.playMilestonePop();
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'companion',
        text: `Oops! ${err.message || 'Something went wrong. Please check your API key in settings.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 8, 11, 0.78)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '580px',
          maxWidth: '92vw',
          height: '640px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-card, #0e1119)',
          borderRadius: '26px',
          borderTop: '1px solid var(--bg-card-border-top, rgba(255, 255, 255, 0.16))',
          borderBottom: '1px solid var(--border-subtle)',
          borderLeft: '1px solid var(--border-subtle)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg), 0 24px 60px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s var(--ease-spring)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface, rgba(14, 16, 23, 0.6))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BeaconCompanion state={isThinking ? 'thinking' : companionMood} size="compact" interactive={false} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Beacon Companion
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 122, 0, 0.12)',
                    color: 'var(--accent-solar, #ff7a00)',
                    border: '1px solid rgba(255, 122, 0, 0.28)',
                  }}
                >
                  ✦ {providerName}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Your autonomous productivity companion
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <Settings size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat History & Suggested Action Chips */}
        <div
          ref={chatScrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Messages */}
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isUser ? 'var(--accent-solar, #ff7a00)' : 'var(--bg-sidebar-card, rgba(255, 255, 255, 0.05))',
                    color: isUser ? '#07080b' : 'var(--text-primary)',
                    fontWeight: isUser ? 600 : 400,
                    fontSize: '13px',
                    lineHeight: 1.45,
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: isUser ? '0 2px 8px rgba(255, 122, 0, 0.3)' : 'var(--shadow-sm)',
                  }}
                >
                  {m.text}

                  {/* Actions Taken Pills */}
                  {m.actionsTaken && m.actionsTaken.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                            backgroundColor: 'rgba(52, 211, 153, 0.14)',
                            color: '#10b981',
                            border: '1px solid rgba(52, 211, 153, 0.25)',
                          }}
                        >
                          <CheckCircle2 size={12} />
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

          {/* Thinking Indicator */}
          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-solar, #ff7a00)' }}>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: 'rgba(255, 122, 0, 0.1)',
                  border: '1px solid rgba(255, 122, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Loader2 size={14} className="animate-spin" />
                <span>Beacon is thinking & updating goals...</span>
              </div>
            </div>
          )}

          {/* Suggested Actions Divider & Grid (shown when not thinking) */}
          {!isThinking && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  What you can ask or do:
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {PRE_GENERATED_ACTIONS.map((cat, catIdx) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={catIdx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface-elevated, rgba(255, 255, 255, 0.025))',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon size={12} color={cat.color} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {cat.category}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {cat.prompts.map((promptText, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={() => handleSendMessage(promptText)}
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              backgroundColor: 'transparent',
                              transition: 'all 0.12s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 122, 0, 0.12)';
                              e.currentTarget.style.color = 'var(--accent-solar, #ff7a00)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                          >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              ✦ {promptText}
                            </span>
                            <ArrowRight size={10} opacity={0.6} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface, rgba(14, 16, 23, 0.6))',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
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
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'var(--search-bg, var(--bg-card))',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isThinking}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: inputValue.trim() && !isThinking ? 'var(--accent-solar, #ff7a00)' : 'var(--btn-ghost-bg, rgba(255, 255, 255, 0.08))',
              border: 'none',
              color: inputValue.trim() && !isThinking ? '#07080b' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: inputValue.trim() && !isThinking ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            {isThinking ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
