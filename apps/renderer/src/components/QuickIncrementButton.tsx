// apps/renderer/src/components/QuickIncrementButton.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface QuickIncrementButtonProps {
  amount: number;
  unit?: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const QuickIncrementButton: React.FC<QuickIncrementButtonProps> = ({
  amount,
  unit,
  onClick,
  disabled = false,
}) => {
  const [pressed, setPressed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 180);
    onClick(e);
  };

  const label = unit ? `+${amount} ${unit}` : `+${amount}`;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        backgroundColor: pressed ? 'var(--accent-solar, #ff7a00)' : 'rgba(255, 122, 0, 0.12)',
        color: pressed ? '#ffffff' : 'var(--accent-solar, #ff7a00)',
        border: '1px solid rgba(255, 122, 0, 0.28)',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: pressed ? 'scale(0.94)' : 'scale(1)',
        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Plus size={12} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
};
