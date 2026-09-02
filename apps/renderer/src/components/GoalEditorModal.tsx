// apps/renderer/src/components/GoalEditorModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Goal, GoalDraft, GoalType, GoalUpdateDraft } from '@shared/types';
import { X, Target, Calendar } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { useDesktopOverlay } from '../hooks/useDesktopOverlay';

interface GoalEditorModalProps {
  goal?: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: GoalDraft | GoalUpdateDraft) => void;
}

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [area, setArea] = useState('Personal');
  const [type, setType] = useState<GoalType>('numeric');
  const [targetValue, setTargetValue] = useState<string>('100');
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [unit, setUnit] = useState('');
  const [defaultIncrement, setDefaultIncrement] = useState<string>('1');
  const [deadline, setDeadline] = useState<string>('');

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Track initial state to detect unsaved changes
  const initialDataRef = useRef({ name: '', targetValue: '100', currentValue: '0', unit: '', deadline: '' });

  useEffect(() => {
    if (goal) {
      const gName = goal.name;
      const gArea = goal.area || 'Personal';
      const gType = goal.type;
      const gTarget = goal.targetValue.toString();
      const gCurrent = goal.currentValue.toString();
      const gUnit = goal.unit || '';
      const gInc = (goal.defaultIncrement || 1).toString();
      const dead = goal.deadline ? goal.deadline.split('T')[0] : '';

      setName(gName);
      setArea(gArea);
      setType(gType);
      setTargetValue(gTarget);
      setCurrentValue(gCurrent);
      setUnit(gUnit);
      setDefaultIncrement(gInc);
      setDeadline(dead);
      if (dead) setCalendarViewDate(new Date(dead));

      initialDataRef.current = { name: gName, targetValue: gTarget, currentValue: gCurrent, unit: gUnit, deadline: dead };
    } else {
      setName('');
      setArea('Personal');
      setType('numeric');
      setTargetValue('100');
      setCurrentValue('0');
      setUnit('');
      setDefaultIncrement('1');
      setDeadline('');
      setCalendarViewDate(new Date());

      initialDataRef.current = { name: '', targetValue: '100', currentValue: '0', unit: '', deadline: '' };
    }
    setShowDiscardConfirm(false);
  }, [goal, isOpen]);

  const isDirty = () => {
    return (
      name !== initialDataRef.current.name ||
      targetValue !== initialDataRef.current.targetValue ||
      currentValue !== initialDataRef.current.currentValue ||
      unit !== initialDataRef.current.unit ||
      deadline !== initialDataRef.current.deadline
    );
  };

  const handleAttemptClose = () => {
    if (isDirty() && name.trim().length > 0) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  useDesktopOverlay({
    isOpen,
    onClose: handleAttemptClose,
    containerRef: modalRef,
    autoFocusRef: nameInputRef,
    hasNestedOverlay: isCalendarOpen || showDiscardConfirm,
  });

  // Calendar popover click outside
  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      type,
      area: area || 'Personal',
      currentValue: parseFloat(currentValue) || 0,
      targetValue: parseFloat(targetValue) || 1,
      unit: unit.trim() || undefined,
      defaultIncrement: parseFloat(defaultIncrement) || 1,
      deadline: deadline || undefined,
    });
    onClose();
  };

  // Helper for formatting date strings
  const formatDateLabel = (isoDate: string) => {
    if (!isoDate) return 'Select date...';
    const [y, m, d] = isoDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Quick preset handlers
  const setQuickDeadline = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const iso = `${y}-${m}-${day}`;
    setDeadline(iso);
    setCalendarViewDate(d);
    setIsCalendarOpen(false);
  };

  const setEndOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const y = lastDay.getFullYear();
    const m = (lastDay.getMonth() + 1).toString().padStart(2, '0');
    const day = lastDay.getDate().toString().padStart(2, '0');
    const iso = `${y}-${m}-${day}`;
    setDeadline(iso);
    setCalendarViewDate(lastDay);
    setIsCalendarOpen(false);
  };

  // Generate calendar month grid
  const viewYear = calendarViewDate.getFullYear();
  const viewMonth = calendarViewDate.getMonth();
  const monthName = calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        ref={modalRef}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#0a0a0c',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#ffffff" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{goal ? 'Edit Goal' : 'Create New Goal'}</h3>
          </div>
          <button type="button" onClick={handleAttemptClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Goal Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Goal Name</label>
            <input
              ref={nameInputRef}
              type="text"
              required
              autoFocus
              placeholder="e.g. Read 20 Books, Learn Rust, Ship MVP..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Goal Type & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Goal Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GoalType)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 10px',
                  backgroundColor: '#141418',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                <option value="numeric">Numeric (hours, etc.)</option>
                <option value="percentage">Percentage (0-100%)</option>
                <option value="count">Count (items, books)</option>
                <option value="binary">Binary (Done / Not Done)</option>
                <option value="milestone">Milestones Only</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Area</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              >
                {['Health', 'Learning', 'Career', 'Projects', 'Finance', 'Personal'].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Value, Current Value & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Current</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Target</label>
              <input
                type="number"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Unit</label>
              <input
                type="text"
                placeholder="hrs, chapters..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          {/* Increment & Interactive Mini-Calendar Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Quick Step</label>
              <input
                type="number"
                step="any"
                value={defaultIncrement}
                onChange={(e) => setDefaultIncrement(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Target Deadline with Popover Mini Calendar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }} ref={calendarRef}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Target Deadline</label>
              
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  backgroundColor: deadline ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.05)',
                  border: isCalendarOpen ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: deadline ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Calendar size={14} color={deadline ? '#ffffff' : '#a1a1aa'} />
                  <span>{formatDateLabel(deadline)}</span>
                </div>
                {deadline && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeadline('');
                    }}
                    style={{ fontSize: '11px', color: '#a1a1aa', padding: '0 4px', cursor: 'pointer' }}
                    title="Clear deadline"
                  >
                    ✕
                  </span>
                )}
              </button>

              {/* Mini Calendar Popover */}
              {isCalendarOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    width: '270px',
                    backgroundColor: '#121216',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Quick Presets */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline(1)}
                      style={{
                        padding: '3px 7px',
                        fontSize: '10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline(7)}
                      style={{
                        padding: '3px 7px',
                        fontSize: '10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      +1 Week
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline(30)}
                      style={{
                        padding: '3px 7px',
                        fontSize: '10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      +1 Month
                    </button>
                    <button
                      type="button"
                      onClick={setEndOfMonth}
                      style={{
                        padding: '3px 7px',
                        fontSize: '10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      End of Month
                    </button>
                  </div>

                  {/* Month Navigation */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{monthName}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setCalendarViewDate(new Date(viewYear, viewMonth - 1, 1))}
                        style={{ padding: '2px 6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarViewDate(new Date(viewYear, viewMonth + 1, 1))}
                        style={{ padding: '2px 6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  {/* Day Names Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '2px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i} style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.4)' }}>
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Day Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                    {calendarDays.map((d, i) => {
                      if (!d) return <div key={i} />;
                      const cellIso = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                      const isSelected = deadline === cellIso;
                      const isToday =
                        new Date().getFullYear() === viewYear &&
                        new Date().getMonth() === viewMonth &&
                        new Date().getDate() === d;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setDeadline(cellIso);
                            setIsCalendarOpen(false);
                          }}
                          style={{
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                            backgroundColor: isSelected ? '#ffffff' : isToday ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                            color: isSelected ? '#000000' : isToday ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={handleAttemptClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {goal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showDiscardConfirm}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in this goal editor. Are you sure you want to discard them?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        isDestructive={true}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </div>
  );
};
