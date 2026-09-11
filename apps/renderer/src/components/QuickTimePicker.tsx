import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';

export interface QuickTimePreset {
  time: string;
  label: string;
  description: string;
}

export const DEFAULT_TIME_PRESETS: QuickTimePreset[] = [
  { time: '08:00', label: '8:00 AM', description: 'Morning' },
  { time: '09:00', label: '9:00 AM', description: 'Work start' },
  { time: '10:00', label: '10:00 AM', description: 'Mid-morning' },
  { time: '12:30', label: '12:30 PM', description: 'Lunch' },
  { time: '14:00', label: '2:00 PM', description: 'Afternoon' },
  { time: '17:00', label: '5:00 PM', description: 'Wrap up' },
  { time: '19:00', label: '7:00 PM', description: 'Evening' },
  { time: '20:30', label: '8:30 PM', description: 'Night' },
  { time: '22:00', label: '10:00 PM', description: 'Wind-down' },
];

export const formatTimeTo12h = (timeStr?: string): string => {
  if (!timeStr || !timeStr.includes(':')) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${period}`;
};

export interface QuickTimePickerProps {
  id?: string;
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const QuickTimePicker: React.FC<QuickTimePickerProps> = ({
  id,
  value = '',
  onChange,
  placeholder = 'Select time (optional)',
  ariaLabel = 'Quiet reminder time',
  style,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const inputId = id || `quick-time-${generatedId}`;
  const popoverId = `quick-time-popover-${generatedId}`;

  // Current parsed hour and minute
  const [currentH, currentM] = useMemo(() => {
    if (!value || !value.includes(':')) return ['09', '00'];
    const parts = value.split(':');
    return [parts[0] || '09', parts[1] || '00'];
  }, [value]);

  const displayValue = useMemo(() => {
    return formatTimeTo12h(value);
  }, [value]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  // Handle keyboard events (Escape to close, ArrowDown to open)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleSelectPreset = (presetTime: string) => {
    onChange(presetTime);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelectMinute = (minute: string) => {
    const newTime = `${currentH}:${minute}`;
    onChange(newTime);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`quick-time-picker-wrapper ${className}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      <div
        className="quick-time-picker-control"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <button
          ref={triggerRef}
          type="button"
          id={inputId}
          className="quick-time-picker-input"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? popoverId : undefined}
          onFocus={() => setIsOpen(true)}
          style={{ textAlign: 'left', cursor: 'pointer' }}
        >
          {displayValue ? (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {displayValue}
            </span>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>
              {placeholder}
            </span>
          )}
        </button>

        {value ? (
          <button
            type="button"
            className="quick-time-clear-btn"
            style={{ padding: 2, marginRight: 2 }}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            aria-label="Clear reminder time"
            title="Clear time"
          >
            <X size={14} />
          </button>
        ) : null}

        <button
          type="button"
          className={`quick-time-picker-clock-btn ${isOpen ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-label={isOpen ? 'Close time picker' : 'Open time picker'}
          title="Open fast time picker"
          tabIndex={-1}
        >
          <Clock size={16} color="var(--accent-primary)" />
        </button>
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          id={popoverId}
          className="quick-time-picker-popover"
          role="dialog"
          aria-modal="false"
          aria-label="Choose reminder time"
        >
          <div className="quick-time-picker-header">
            <span className="quick-time-picker-title">Quick Times</span>
            {value && (
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                }}
              >
                {formatTimeTo12h(value)}
              </span>
            )}
          </div>

          <div className="quick-time-picker-presets" role="group" aria-label="Preset times">
            {DEFAULT_TIME_PRESETS.map((preset) => {
              const isSelected = value === preset.time;
              return (
                <button
                  key={preset.time}
                  type="button"
                  className={`quick-time-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset.time)}
                  aria-pressed={isSelected}
                  aria-label={`${preset.label}, ${preset.description}`}
                >
                  <span>{preset.label}</span>
                  <span className="quick-time-chip-sub">{preset.description}</span>
                </button>
              );
            })}
          </div>

          <div className="quick-time-picker-section-label">Common Minutes</div>
          <div className="quick-time-picker-intervals" role="group" aria-label="Minute intervals">
            {['00', '15', '30', '45'].map((min) => {
              const isActive = currentM === min && Boolean(value);
              return (
                <button
                  key={min}
                  type="button"
                  className={`quick-time-interval-chip ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectMinute(min)}
                  aria-pressed={isActive}
                  aria-label={`${min} minutes past the hour`}
                >
                  :{min}
                </button>
              );
            })}
          </div>

          <div className="quick-time-picker-footer">
            <button
              type="button"
              className="quick-time-clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="quick-time-done-btn"
              onClick={() => {
                if (!value) {
                  onChange('09:00');
                }
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
