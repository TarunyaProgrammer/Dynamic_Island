import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

export interface QuickDatePickerProps {
  id?: string;
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const formatDateDisplay = (dateStr?: string): string => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = target.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  if (diffDays === 0) return `Today (${formatted})`;
  if (diffDays === 1) return `Tomorrow (${formatted})`;
  if (diffDays === 2) return `In 2 days (${formatted})`;
  if (diffDays === -1) return `Yesterday (${formatted})`;
  return formatted;
};

export const getQuickDatePresets = (): { label: string; date: string; relative: string }[] => {
  const toDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const inTwoDays = new Date(today);
  inTwoDays.setDate(inTwoDays.getDate() + 2);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    { label: 'Today', date: toDateStr(today), relative: 'Today' },
    { label: 'Tomorrow', date: toDateStr(tomorrow), relative: 'Tomorrow' },
    { label: 'In 2 days', date: toDateStr(inTwoDays), relative: 'In 2 days' },
    { label: 'In 1 week', date: toDateStr(nextWeek), relative: 'In 7 days' },
  ];
};

export const QuickDatePicker: React.FC<QuickDatePickerProps> = ({
  id,
  value = '',
  onChange,
  placeholder = 'Select date',
  ariaLabel = 'Select date',
  className = '',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id || `quick-date-${generatedId}`;

  const displayValue = useMemo(() => formatDateDisplay(value), [value]);
  const presets = useMemo(() => getQuickDatePresets(), []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(false);
    }
  };

  const handleSelect = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`quick-date-picker-wrapper ${className}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <div
        className="quick-date-picker-control"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <button
          type="button"
          id={inputId}
          className="quick-date-picker-input"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onFocus={() => setIsOpen(true)}
          style={{ textAlign: 'left', cursor: 'pointer' }}
        >
          {displayValue ? (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayValue}</span>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>
          )}
        </button>

        {value ? (
          <button
            type="button"
            className="quick-time-clear-btn"
            style={{ padding: 2, marginRight: 2 }}
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setIsOpen(false);
            }}
            aria-label="Clear date"
            title="Clear date"
          >
            <X size={14} />
          </button>
        ) : null}

        <button
          type="button"
          className="quick-date-picker-calendar-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-label="Toggle calendar picker"
          tabIndex={-1}
        >
          <CalendarIcon size={15} color="var(--accent-primary)" />
        </button>
      </div>

      {isOpen && (
        <div className="quick-date-picker-popover" role="dialog" aria-label="Choose date">
          <div className="quick-date-presets" role="group" aria-label="Quick date options">
            {presets.map((preset) => {
              const isActive = value === preset.date;
              return (
                <button
                  key={preset.date}
                  type="button"
                  className={`quick-date-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelect(preset.date)}
                >
                  <div style={{ fontWeight: 600 }}>{preset.label}</div>
                  <div style={{ fontSize: 9, opacity: 0.75 }}>{preset.date}</div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
            <input
              ref={nativeInputRef}
              type="date"
              className="input"
              value={value}
              onChange={(e) => {
                if (e.target.value) {
                  handleSelect(e.target.value);
                }
              }}
              style={{ flex: 1, minHeight: 32, fontSize: 12 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
