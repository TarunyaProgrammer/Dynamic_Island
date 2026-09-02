// apps/renderer/src/components/BeaconLogo.tsx
import React from 'react';

interface BeaconLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const BeaconLogo: React.FC<BeaconLogoProps> = ({ size = 18, className, style }) => {
  return (
    <img
      src="/logo.png"
      alt="Beacon Logo"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      draggable={false}
    />
  );
};
