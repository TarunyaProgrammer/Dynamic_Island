// apps/renderer/src/surfaces/CommandPaletteView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useGoals } from '../hooks/useGoals';
import { Search, Plus, Command, ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { useToday } from '../hooks/useToday';

export const CommandPaletteView: React.FC = () => {
  const { goals, incrementProgress, createGoal } = useGoals('active');
  const today = useToday();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and reset state on window focus
  useEffect(() => {
    const handleFocus = () => {
      setQuery('');
      setSelectedIndex(0);
      setIsThinking(false);
      setAiResponse(null);
      inputRef.current?.focus();
    };

    window.addEventListener('focus', handleFocus);
    // Initial mount focus
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        window.beacon.windows.togglePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredGoals = goals.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase()) ||
    (g.area && g.area.toLowerCase().includes(query.toLowerCase()))
  );

  const handleExecute = async (goalId: string, delta?: number) => {
    await incrementProgress(goalId, delta);
    window.beacon.windows.togglePalette();
  };

  const handleExecuteAI = async (text: string) => {
    if (!text.trim() || isThinking) return;
    setIsThinking(true);
    setAiResponse(null);
    try {
      const result = await window.beacon.ai.executePrompt(text.trim());
      setAiResponse(result.reply);
      setTimeout(() => {
        window.beacon.windows.togglePalette();
      }, 2200);
    } catch (err: any) {
      setAiResponse(`Error: ${err.message || 'AI request failed'}`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (isThinking) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredGoals.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredGoals.length) % Math.max(1, filteredGoals.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;

      // Check for quick creation syntax: "new [title]"
      if (trimmed.toLowerCase().startsWith('new ')) {
        const title = trimmed.slice(4).trim();
        if (title) {
          await createGoal({ name: title, type: 'numeric', targetValue: 100 });
          window.beacon.windows.togglePalette();
          return;
        }
      }

      if (trimmed.toLowerCase() === 'today') {
        window.beacon.windows.toggleMain();
        window.beacon.windows.togglePalette();
        return;
      }

      if (trimmed.toLowerCase().startsWith('done ')) {
        const action = today.actions.find((item) => item.title.toLowerCase() === trimmed.slice(5).trim().toLowerCase());
        if (action) { await today.complete(action.id); window.beacon.windows.togglePalette(); return; }
      }

      const focusMatch = trimmed.match(/^focus\s+(.+?)(?:\s+(\d+)m)?$/i);
      if (focusMatch) {
        const action = today.actions.find((item) => item.title.toLowerCase() === focusMatch[1].toLowerCase());
        if (action) { await window.beacon.focus.start(Number(focusMatch[2] ?? 25), action.goalId, action.id); window.beacon.windows.togglePalette(); return; }
      }

      const planMatch = trimmed.match(/^plan\s+(.+?)\s*:\s*(.+)$/i);
      if (planMatch) {
        const goal = goals.find((item) => item.name.toLowerCase() === planMatch[1].toLowerCase());
        if (goal) {
          const action = await today.createAction({ goalId: goal.id, title: planMatch[2] });
          await today.planAction(action.id);
          window.beacon.windows.togglePalette();
          return;
        }
      }

      // If goals match and index is valid, execute progress on selected goal
      if (filteredGoals.length > 0 && filteredGoals[selectedIndex]) {
        await handleExecute(filteredGoals[selectedIndex].id);
      } else {
        // Natural language query -> pass to Beacon Companion AI!
        await handleExecuteAI(trimmed);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#000000',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}
    >
      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#08080a',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Search size={18} color="#ffffff" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Type to search goals, '+1 [name]' or 'new [name]'..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            fontSize: '14px',
            color: 'var(--text-primary)',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
          }}
        />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
          esc to close
        </span>
      </div>

      {/* Goal Results List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Active AI Processing State */}
        {isThinking && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <Loader2 size={16} className="animate-spin" />
            <span>Beacon Companion is planning & executing...</span>
          </div>
        )}

        {/* AI Response Card */}
        {aiResponse && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffffff', fontSize: '11px', fontWeight: 700 }}>
              <CheckCircle2 size={14} />
              <span>BEACON COMPANION</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#ffffff', lineHeight: 1.4 }}>
              {aiResponse}
            </p>
          </div>
        )}

        {/* Natural Language Prompt Suggestion Card */}
        {query.trim().length > 2 && !isThinking && !aiResponse && !query.trim().toLowerCase().startsWith('new ') && (
          <div
            onClick={() => handleExecuteAI(query.trim())}
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="#ffffff" />
              <span style={{ fontSize: '12px', color: '#ffffff' }}>
                Ask Beacon Companion: <strong>"{query.trim()}"</strong>
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
              Press ↵
            </span>
          </div>
        )}

        {query.trim().toLowerCase().startsWith('new ') && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <Plus size={14} />
            <span>Create new goal: <strong>"{query.slice(4).trim()}"</strong></span>
          </div>
        )}

        {filteredGoals.length === 0 && !query.trim().startsWith('new ') && !isThinking && !aiResponse && query.trim().length <= 2 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', gap: '6px' }}>
            <Command size={20} opacity={0.4} />
            <span style={{ fontSize: '12px' }}>Type any natural language command or search goals...</span>
          </div>
        ) : (
          filteredGoals.map((g, idx) => {
            const isSelected = idx === selectedIndex;
            const fraction = g.targetValue > 0 ? Math.min(1.0, g.currentValue / g.targetValue) : 0;
            return (
              <div
                key={g.id}
                onClick={() => handleExecute(g.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GoalProgressRing progressFraction={fraction} size={26} strokeWidth={2.5} showText={false} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {g.name}
                      </span>
                      {g.area && g.area !== 'Personal' && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '1px 5px', borderRadius: '3px' }}>
                          {g.area}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {g.currentValue} / {g.targetValue} {g.unit || ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    +{g.defaultIncrement || 1}
                  </span>
                  {isSelected && <ArrowRight size={12} color="rgba(255, 255, 255, 0.5)" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer shortcut hints */}
      <div
        style={{
          padding: '8px 14px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <span><kbd style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>↵</kbd> Increment</span>
          <span><kbd style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>↑↓</kbd> Select</span>
        </div>
        <span>Beacon Command Engine</span>
      </div>
    </div>
  );
};
