import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * If the GLB fails to load or decode, fall back to the procedural brain
 * rather than dropping the reader onto an empty stage.
 */
export default class BrainFallback extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[story] brain model failed, using placeholder", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
