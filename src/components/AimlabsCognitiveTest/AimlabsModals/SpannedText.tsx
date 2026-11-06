import React from "react";

interface SpannedTextProps {
  text: string;
  className?: string;
}

// Letter-spaced heading: renders one <span> per character (incl. spaces) so
// uppercase tracking-wide headings justify evenly edge-to-edge.
export const SpannedText: React.FC<SpannedTextProps> = ({ text, className = "" }) => (
  <div className={`flex justify-between w-full font-offbit uppercase tracking-normal select-none ${className}`}>
    {text.split("").map((char, index) => (
      <span key={index}>{char === " " ? " " : char}</span>
    ))}
  </div>
);
