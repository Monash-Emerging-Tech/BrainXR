// Shared fade-in/fade-out transition state, owned by the AimlabsModals
// orchestrator and threaded through to whichever screen is active so a
// screen switch doesn't reset the fade.
export interface ScreenTransitionProps {
  mounted: boolean;
  isFadingOut: boolean;
  handleAction: (callback: () => void) => void;
}

export function transitionClasses(mounted: boolean, isFadingOut: boolean): string {
  return mounted && !isFadingOut
    ? "opacity-100 scale-100 pointer-events-auto"
    : "opacity-0 scale-[0.98] pointer-events-none";
}
