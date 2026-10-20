import React from "react";

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

// Shapes selected from iconmonstr.com. They intentionally use currentColor
// so the existing BrainXR button states continue to control their colour.
export const Arrow74Icon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0 4 9h6v15h4V9h6L12 0Z" />
  </svg>
);

export const MediaControl13Icon: React.FC<IconProps> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M0 5v14l10-7L0 5Zm12 0v14l10-7-10-7Z" />
  </svg>
);

export const MediaControl14Icon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M0 5v14l10-7L0 5Zm2 3.84L6.52 12 2 15.16V8.84ZM12 5v14l10-7-10-7Zm2 3.84L18.52 12 14 15.16V8.84Z" clipRule="evenodd" />
  </svg>
);

export const PlayThinIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M1 0v24l22-12L1 0Zm2 3.37L18.83 12 3 20.63V3.37Z" clipRule="evenodd" />
  </svg>
);

export const PauseThinIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M3 0h8v24H3V0Zm2 2v20h4V2H5Zm8-2h8v24h-8V0Zm2 2v20h4V2h-4Z" clipRule="evenodd" />
  </svg>
);

export const XMark1Icon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.83 0 12 7.17 19.17 0 24 4.83 16.83 12 24 19.17 19.17 24 12 16.83 4.83 24 0 19.17 7.17 12 0 4.83 4.83 0Z" />
  </svg>
);
