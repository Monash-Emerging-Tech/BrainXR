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
      className="flex items-center justify-center p-2 md:p-2.5 rounded-full bg-slate-900/90 border border-slate-700/50 backdrop-blur-md text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-xl hover:border-slate-600"
      title="Exit to main menu"
    >
      <Arrow74Icon className="h-5 w-5" style={{ transform: "rotate(-90deg)" }} />
    </button>
  </div>
);

export default BackButton;
