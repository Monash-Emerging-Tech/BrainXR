import React from "react";
import { Arrow74Icon } from "../icons/IconmonstrIcons";

interface BackButtonProps {
  onClick: () => void;
}

// Exit-to-idle button, top-left of the HUD nav bar.
const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <div className="pointer-events-auto">
    <button
      onClick={onClick}
      className="flex cursor-pointer items-center justify-center rounded-full border border-white/15 bg-slate-950/68 p-2 text-slate-200 shadow-lg shadow-slate-900/10 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/35 hover:bg-slate-950/82 hover:text-white active:translate-y-0 active:scale-95 md:p-2.5"
      title="Exit to main menu"
    >
      <Arrow74Icon className="h-5 w-5" style={{ transform: "rotate(-90deg)" }} />
    </button>
  </div>
);

export default BackButton;
