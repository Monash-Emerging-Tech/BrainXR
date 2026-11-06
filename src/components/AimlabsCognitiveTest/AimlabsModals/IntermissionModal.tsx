import React, { useState } from "react";
import type { RoundMetrics } from "../types";
import { ModalDecorativeField } from "./ModalDecorativeField";
import { SpannedText } from "./SpannedText";
import { transitionClasses, type ScreenTransitionProps } from "./screenTransition";

interface IntermissionModalProps extends ScreenTransitionProps {
  round1Metrics: RoundMetrics | null;
  round2Metrics: RoundMetrics | null;
  onStartRound2: () => void;
}

// Two sequential screens: Screen 1 = Round 1 telemetry report, Screen 2 =
// Round 2 rule-reversal briefing. Mounted fresh each time status enters
// "intermission", so starting back on the telemetry screen needs no explicit
// reset effect.
export const IntermissionModal: React.FC<IntermissionModalProps> = ({
  round1Metrics,
  round2Metrics,
  onStartRound2,
  mounted,
  isFadingOut,
  handleAction,
}) => {
  const [intermissionStep, setIntermissionStep] = useState<"telemetry" | "rules">("telemetry");

  // Intermission always occurs after Round 1 and transitions into Round 2.
  // If round1Metrics exists, Round 1 was CPT, so the upcoming Round 2 is SART.
  // If round2Metrics exists, Round 1 was SART, so the upcoming Round 2 is CPT.
  const prevMetrics = round1Metrics || round2Metrics!;
  const isNextSART = Boolean(round1Metrics);
  const nextRoundName = isNextSART ? "Round 2 (SART)" : "Round 2 (CPT)";
  const nextRoundTag = isNextSART ? "ROUND 2 · SART" : "ROUND 2 · CPT";
  const completedRoundName = "ROUND 1 COMPLETE";
  const completedParadigm = isNextSART ? "CPT" : "SART";

  const prevGo = (prevMetrics.goHits || 0) + (prevMetrics.omissions || 0);
  const prevOmissionRate =
    prevMetrics.omissionRate ?? (prevGo > 0 ? Math.round(((prevMetrics.omissions || 0) / prevGo) * 100) : 0);

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-[#0d0d10]/70 backdrop-blur-md px-4 font-sans select-none overflow-y-auto py-6 transition-all duration-300 ease-out ${transitionClasses(mounted, isFadingOut)}`}
    >
      <ModalDecorativeField />

      <div className="relative z-10 max-w-2xl sm:max-w-3xl w-full flex flex-col items-center text-center px-6 sm:px-8 py-7 bg-[#0d0d10]/90 border border-white/15 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {intermissionStep === "telemetry" ? (
          /* ================= SCREEN 1: ROUND 1 TELEMETRY REPORT ================= */
          <>
            <div className="inline-flex items-center gap-2 rounded-md bg-[#F3DA66]/10 px-3.5 py-1 text-xs font-mono tracking-wider text-[#F3DA66] border border-[#F3DA66]/30 backdrop-blur-md mb-2 uppercase font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F3DA66] animate-pulse" />
              {completedRoundName}
            </div>

            <div className="w-full px-4 mb-1">
              <SpannedText
                text="TELEMETRY REPORT"
                className="text-white text-2xl sm:text-3xl font-bold"
              />
            </div>

            <p className="text-xs text-slate-400 font-mono mb-4">
              Round 1 ({completedParadigm}) response profile & intra-individual latency distribution
            </p>

            {/* Simplified Action & Result Summary Table (2 Columns: User Action, Result) */}
            <div className="w-full bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden my-3 text-xs font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.05] text-slate-400 border-b border-white/10 text-[11px]">
                    <th className="py-2.5 px-4 font-semibold uppercase">User Action</th>
                    <th className="py-2.5 px-4 font-semibold uppercase">Result</th>
                    <th className="py-2.5 px-4 text-right font-semibold uppercase">Trials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 px-4 text-white font-medium">Hit</td>
                    <td className="py-2 px-4 text-emerald-400 font-bold">Correct</td>
                    <td className="py-2 px-4 text-right font-bold text-white font-offbit text-sm">{prevMetrics.goHits}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-white font-medium">Hit</td>
                    <td className="py-2 px-4 text-rose-400 font-bold">Incorrect</td>
                    <td className="py-2 px-4 text-right font-bold text-rose-400 font-offbit text-sm">{prevMetrics.commissions}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-white font-medium">Avoided</td>
                    <td className="py-2 px-4 text-emerald-400 font-bold">Correct</td>
                    <td className="py-2 px-4 text-right font-bold text-emerald-400 font-offbit text-sm">{prevMetrics.correctRejections}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-white font-medium">Avoided</td>
                    <td className="py-2 px-4 text-rose-400 font-bold">Incorrect</td>
                    <td className="py-2 px-4 text-right font-bold text-rose-400 font-offbit text-sm">{prevMetrics.omissions}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Timing, Accuracy & Precision Metrics */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 my-2 text-center font-mono">
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Mean RT</div>
                <div className="text-xl font-bold text-cyan-300 font-offbit mt-0.5">
                  {Math.round(prevMetrics.meanReactionTime)}ms
                </div>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Response Time CV</div>
                <div className="text-xl font-bold text-[#F3DA66] font-offbit mt-0.5">
                  {prevMetrics.cv ? `${prevMetrics.cv}x` : "--"}
                </div>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</div>
                <div className="text-xl font-bold text-emerald-400 font-offbit mt-0.5">
                  {Math.round(prevMetrics.accuracy)}%
                </div>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Precision</div>
                <div className="text-xl font-bold text-indigo-300 font-offbit mt-0.5">
                  {Math.round(prevMetrics.precision ?? 100)}%
                </div>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Omission Rate</div>
                <div className="text-xl font-bold text-rose-400 font-offbit mt-0.5">
                  {prevOmissionRate}%
                </div>
              </div>
            </div>

            {/* Informational Callout: Report Available at End */}
            <div className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-400/30 text-cyan-200 text-xs font-mono my-3 text-left">
              <span className="text-lg flex-shrink-0">📊</span>
              <span className="leading-relaxed">
                Your complete cognitive performance report with full trial telemetry graphs can be <strong>viewed & downloaded</strong> at the end of the session.
              </span>
            </div>

            {/* Single Next Button -> Transitions to Screen 2 */}
            <button
              onClick={() => setIntermissionStep("rules")}
              className="w-full mt-2 py-3.5 px-6 rounded-lg bg-white text-black hover:bg-slate-200 font-offbit uppercase font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white flex items-center justify-center gap-2"
            >
              <span>Next: Review {nextRoundName} Rules</span>
              <span>→</span>
            </button>
          </>
        ) : (
          /* ================= SCREEN 2: ROUND 2 RULES ================= */
          <>
            <div
              className={`inline-flex items-center gap-2 rounded-md px-3.5 py-1 text-xs font-mono tracking-wider backdrop-blur-md mb-2 uppercase font-semibold border ${
                isNextSART
                  ? "bg-rose-400/10 text-rose-300 border-rose-400/30"
                  : "bg-cyan-400/10 text-cyan-300 border-cyan-400/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isNextSART ? "bg-rose-400" : "bg-cyan-400"
                }`}
              />
              {nextRoundTag}
            </div>

            <div className="w-full px-4 mb-1">
              <SpannedText
                text="RULE REVERSAL"
                className="text-white text-2xl sm:text-3xl font-bold"
              />
            </div>

            <p className="text-xs text-slate-400 font-mono mb-4">
              {isNextSART
                ? "Sustained Attention to Response Task (SART)"
                : "Continuous Performance Test (CPT)"}
            </p>

            {/* Rule Reversal Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-left font-mono">
              {isNextSART ? (
                <>
                  {/* Red Box -> PRESS */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                      <div>
                        <div className="text-[10px] text-rose-300 uppercase font-semibold">Target Stimulus</div>
                        <div className="text-white font-bold text-sm">Red Box</div>
                      </div>
                    </div>
                    <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/50 font-bold tracking-wider">
                      PRESS
                    </span>
                  </div>

                  {/* Green Sphere -> DO NOT PRESS */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      <div>
                        <div className="text-[10px] text-emerald-300 uppercase font-semibold">Inhibitory Distractor</div>
                        <div className="text-slate-300 font-bold text-sm">Green Sphere</div>
                      </div>
                    </div>
                    <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                      DO NOT PRESS
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Green Sphere -> PRESS */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      <div>
                        <div className="text-[10px] text-emerald-300 uppercase font-semibold">Target Stimulus</div>
                        <div className="text-white font-bold text-sm">Green Sphere</div>
                      </div>
                    </div>
                    <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/50 font-bold tracking-wider">
                      PRESS
                    </span>
                  </div>

                  {/* Red Box -> DO NOT PRESS */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-xs bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                      <div>
                        <div className="text-[10px] text-rose-300 uppercase font-semibold">Inhibitory Distractor</div>
                        <div className="text-slate-300 font-bold text-sm">Red Box</div>
                      </div>
                    </div>
                    <span className="font-offbit text-xs uppercase px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 font-bold tracking-wider">
                      DO NOT PRESS
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Subtext info: single line without squeezing */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 my-4 whitespace-nowrap">
              <span className="text-cyan-300 font-medium">1 Target at a Time</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">500ms flash + 700ms fixation</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#F3DA66] font-medium">Stroop Effect on Instructions</span>
            </div>

            {/* Navigation Buttons: Back to Telemetry and Start Round */}
            <div className="flex items-center gap-3 w-full mt-2 font-mono text-xs">
              <button
                onClick={() => setIntermissionStep("telemetry")}
                className="flex-1 py-3 px-5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 border border-white/15"
              >
                ← Back
              </button>
              <button
                onClick={() => handleAction(onStartRound2)}
                className="flex-2 py-3 px-6 rounded-lg bg-white text-black hover:bg-slate-200 font-offbit uppercase font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white flex items-center justify-center gap-2"
              >
                Start {nextRoundName} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
