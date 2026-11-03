import React from "react";
import type { TargetTelemetryRecord } from "./types";

interface TelemetryPerformanceGraphProps {
  telemetry: TargetTelemetryRecord[];
  meanRT: number;
  medianRT?: number;
  sdRT: number;
  cv: number;
  accuracy: number;
  precision?: number;
  focusLevel: string;
  showAllTrials?: boolean;
  className?: string;
}

export const TelemetryPerformanceGraph: React.FC<TelemetryPerformanceGraphProps> = ({
  telemetry,
  meanRT,
  medianRT = 0,
  sdRT,
  cv,
  accuracy,
  precision,
  focusLevel,
  showAllTrials = false,
  className = "",
}) => {
  const data = showAllTrials ? telemetry : telemetry.slice(-35);
  const count = data.length;

  const focusBadgeColor =
    focusLevel === "Optimal Focus"
      ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/40"
      : focusLevel === "Steady Focus"
      ? "text-cyan-400 bg-cyan-950/60 border-cyan-500/40"
      : focusLevel === "Variable Focus"
      ? "text-[#F3DA66] bg-[#F3DA66]/15 border-[#F3DA66]/40"
      : "text-slate-400 bg-slate-900/60 border-slate-700/40";

  // Detect round split point (Round 1 vs Round 2)
  let splitIndex = -1;
  if (showAllTrials || count > 50) {
    for (let i = 1; i < count; i++) {
      if (
        data[i].trialIndex < data[i - 1].trialIndex ||
        (data[i].trialIndex > 187 && data[i - 1].trialIndex <= 187)
      ) {
        splitIndex = i;
        break;
      }
    }
    if (splitIndex === -1 && count >= 180) {
      splitIndex = Math.floor(count / 2);
    }
  }

  return (
    <div className={`w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 shadow-2xl font-mono text-left ${className}`}>
      {/* Graph Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs text-white font-bold uppercase tracking-wider">Session Performance</span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${focusBadgeColor}`}>
            {focusLevel}
          </span>
          {cv > 0 && (
            <span className="text-[10px] text-[#F3DA66] bg-[#F3DA66]/15 border border-[#F3DA66]/30 px-2 py-0.5 rounded-full font-semibold">
              RT CV: {(cv * 100).toFixed(0)}% (±{sdRT}ms)
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] flex-wrap justify-end">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Trial RT (Hit)</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
            <span>Moving RT</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#F3DA66]">
            <span className="w-2.5 h-2 rounded-xs bg-[#F3DA66]/40 border border-[#F3DA66]/70" />
            <span>±1.5x SD Band</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#F3DA66]/80">
            <span className="w-2.5 h-0.5 border-b border-dashed border-[#F3DA66]" />
            <span>±1.5x SD Whisker</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
            <span>Accuracy %</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 border border-white" />
            <span>Hit (Incorrect)</span>
          </div>
        </div>
      </div>

      {/* SVG Graph Viewport */}
      <div className="w-full h-44 relative my-1">
        {data && data.length > 1 ? (
          (() => {
            const W = 680;
            const H = 184;
            const padL = 44;
            const padR = 44;
            const padT = 24;
            const padB = 28;
            const innerW = W - padL - padR;
            const innerH = H - padT - padB;

            // Scales: RT (Left Axis) 100ms - 580ms
            const minRT = 100;
            const maxRT = 580;
            const rtRange = maxRT - minRT;
            const getYForRT = (val: number) => {
              const clamped = Math.max(minRT, Math.min(maxRT, val));
              return padT + innerH - ((clamped - minRT) / rtRange) * innerH;
            };

            // Scale: Accuracy (Right Axis) 0 - 100%
            const getYForAcc = (acc: number) => {
              return padT + innerH - (acc / 100) * innerH;
            };

            const getX = (idx: number) => padL + (idx / Math.max(1, count - 1)) * innerW;

            // Compute Envelope Points
            const innerUpperPoints: string[] = [];
            const innerLowerPoints: string[] = [];
            const outerUpperPoints: string[] = [];
            const outerLowerPoints: string[] = [];
            const whiskerTopLine: string[] = [];
            const whiskerBottomLine: string[] = [];
            const movingAvgPoints: string[] = [];
            const accPoints: string[] = [];

            data.forEach((d, i) => {
              const x = getX(i);
              const avg = d.movingAverageRT > 0 ? d.movingAverageRT : (d.reactionTime || meanRT || 300);
              const sdev = d.movingSdRT || sdRT || 35;

              const yAvg = getYForRT(avg);
              const yInnerUpper = getYForRT(avg - sdev);
              const yInnerLower = getYForRT(avg + sdev);
              const yOuterUpper = getYForRT(avg - 1.5 * sdev);
              const yOuterLower = getYForRT(avg + 1.5 * sdev);

              movingAvgPoints.push(`${x.toFixed(1)},${yAvg.toFixed(1)}`);
              innerUpperPoints.push(`${x.toFixed(1)},${yInnerUpper.toFixed(1)}`);
              innerLowerPoints.push(`${x.toFixed(1)},${yInnerLower.toFixed(1)}`);
              outerUpperPoints.push(`${x.toFixed(1)},${yOuterUpper.toFixed(1)}`);
              outerLowerPoints.push(`${x.toFixed(1)},${yOuterLower.toFixed(1)}`);

              whiskerTopLine.push(`${x.toFixed(1)},${yOuterUpper.toFixed(1)}`);
              whiskerBottomLine.push(`${x.toFixed(1)},${yOuterLower.toFixed(1)}`);

              const yAcc = getYForAcc(d.cumulativeAccuracy);
              accPoints.push(`${x.toFixed(1)},${yAcc.toFixed(1)}`);
            });

            const outerBandPolygon = `${outerUpperPoints.join(" ")} ${outerLowerPoints.reverse().join(" ")}`;
            const innerBandPolygon = `${innerUpperPoints.join(" ")} ${innerLowerPoints.reverse().join(" ")}`;

            const xSplit = splitIndex > 0 ? getX(splitIndex) : null;

            return (
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <defs>
                  {/* Outer 1.5x SD Whisker Band Fill */}
                  <linearGradient id="perfOuterSdBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F3DA66" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#F3DA66" stopOpacity="0.02" />
                  </linearGradient>
                  {/* Inner 1.0x SD Core Focus Band Fill */}
                  <linearGradient id="perfInnerSdBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F3DA66" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#F3DA66" stopOpacity="0.10" />
                  </linearGradient>
                </defs>

                {/* Horizontal Baseline Grids */}
                {[200, 300, 400, 500].map((val) => {
                  const y = getYForRT(val);
                  return (
                    <g key={val}>
                      <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#1e293b" strokeDasharray="2 3" strokeWidth="1" />
                      <text x={padL - 6} y={y + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Right Axis Accuracy Marks */}
                {[100, 75, 50].map((val) => {
                  const y = getYForAcc(val);
                  return (
                    <text key={val} x={W - padR + 6} y={y + 3} fill="#10b981" fontSize="8" textAnchor="start" fontFamily="monospace">
                      {val}%
                    </text>
                  );
                })}

                {/* Outer ±1.5x SD Band Polygon */}
                {outerBandPolygon && <polygon points={outerBandPolygon} fill="url(#perfOuterSdBand)" />}

                {/* Outer Whisker Dashed Lines */}
                {whiskerTopLine.length > 1 && (
                  <polyline points={whiskerTopLine.join(" ")} fill="none" stroke="#F3DA66" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
                )}
                {whiskerBottomLine.length > 1 && (
                  <polyline points={whiskerBottomLine.join(" ")} fill="none" stroke="#F3DA66" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
                )}

                {/* Inner ±1.0x SD Core Band Polygon */}
                {innerBandPolygon && <polygon points={innerBandPolygon} fill="url(#perfInnerSdBand)" />}

                {/* Accuracy Curve (Emerald Dashed) */}
                {accPoints.length > 1 && (
                  <polyline points={accPoints.join(" ")} fill="none" stroke="#34d399" strokeWidth="1.6" strokeDasharray="3 2" opacity="0.85" />
                )}

                {/* Moving Average RT Line (Cyan) */}
                {movingAvgPoints.length > 1 && (
                  <polyline points={movingAvgPoints.join(" ")} fill="none" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* ================= ROUND SEPARATION DIVIDER ================= */}
                {xSplit != null && (
                  <g>
                    {/* Vertical Divider Line */}
                    <line
                      x1={xSplit}
                      y1={padT - 6}
                      x2={xSplit}
                      y2={padT + innerH}
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />

                    {/* Round 1 Badge */}
                    <rect
                      x={xSplit - 84}
                      y={padT - 2}
                      width="78"
                      height="15"
                      rx="4"
                      fill="#070b12"
                      stroke="rgba(56, 189, 248, 0.5)"
                      strokeWidth="1"
                    />
                    <text
                      x={xSplit - 45}
                      y={padT + 9}
                      fill="#38bdf8"
                      fontSize="7.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      Round 1 (CPT)
                    </text>

                    {/* Round 2 Badge */}
                    <rect
                      x={xSplit + 6}
                      y={padT - 2}
                      width="82"
                      height="15"
                      rx="4"
                      fill="#070b12"
                      stroke="rgba(251, 113, 133, 0.5)"
                      strokeWidth="1"
                    />
                    <text
                      x={xSplit + 47}
                      y={padT + 9}
                      fill="#fb7185"
                      fontSize="7.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      Round 2 (SART)
                    </text>
                  </g>
                )}

                {/* Scatter markers */}
                {data.map((d, i) => {
                  if (!d.reactionTime) return null;
                  const x = getX(i);
                  const y = getYForRT(d.reactionTime);
                  const isIncorrectHit = !d.isGo && d.userResponded;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={isIncorrectHit ? 3.2 : 2}
                      fill={isIncorrectHit ? "#f43f5e" : "#22d3ee"}
                      stroke={isIncorrectHit ? "#ffffff" : "none"}
                      strokeWidth={isIncorrectHit ? 0.9 : 0}
                      opacity={0.85}
                    >
                      <title>{`Trial #${d.trialIndex}: Action ${d.userResponded ? "Hit" : "Avoided"} (${d.isCorrect ? "Correct" : "Incorrect"}) - ${d.reactionTime}ms`}</title>
                    </circle>
                  );
                })}

                {/* Bottom X-Axis Line */}
                <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="#334155" strokeWidth="1" />

                {/* X-Axis Trial Markers */}
                {(() => {
                  const numTicks = Math.min(count, 5);
                  if (numTicks <= 1) return null;
                  const tickIndices = Array.from({ length: numTicks }, (_, idx) =>
                    Math.round((idx / (numTicks - 1)) * (count - 1))
                  );
                  return tickIndices.map((dataIdx) => {
                    const x = getX(dataIdx);
                    const trialNum = data[dataIdx]?.trialIndex ?? dataIdx + 1;
                    return (
                      <g key={dataIdx}>
                        <line
                          x1={x}
                          y1={padT + innerH}
                          x2={x}
                          y2={padT + innerH + 4}
                          stroke="#475569"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={padT + innerH + 13}
                          fill="#64748b"
                          fontSize="7.5"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          T#{trialNum}
                        </text>
                      </g>
                    );
                  });
                })()}

                {/* X-Axis Title */}
                <text
                  x={W / 2}
                  y={H - 2}
                  fill="#64748b"
                  fontSize="7.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  TRIAL SEQUENCE (N = {count})
                </text>

                {/* Round Separation Label at Bottom of Divider */}
                {xSplit != null && (
                  <text
                    x={xSplit}
                    y={padT + innerH + 22}
                    fill="#fb7185"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    RULE INVERSION
                  </text>
                )}

                {/* Left/Right Axis Titles: Positioned above the chart with ample vertical clearance */}
                <text x={padL} y={padT - 10} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  RT (ms)
                </text>
                <text x={W - padR} y={padT - 10} fill="#34d399" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  ACC (%)
                </text>
              </svg>
            );
          })()
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 italic bg-black/30 rounded-xl border border-white/10">
            <span>Collecting live response telemetry...</span>
            <span className="text-[10px] text-slate-600 mt-1">Plotting moving average, dual SD bands, and accuracy</span>
          </div>
        )}
      </div>

      {/* Bottom Summary Bar - Clean CSS Grid prevents text overlap */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-300 pt-2.5 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase">Mean RT:</span>
          <span className="font-bold text-cyan-400">{meanRT}ms</span>
        </div>
        {medianRT > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase">Median RT:</span>
            <span className="font-bold text-purple-300">{medianRT}ms</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase">Trials:</span>
            <span className="font-bold text-white">{count}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase">Response Time CV:</span>
          <span className="font-bold text-[#F3DA66]">
            ±{sdRT}ms {cv > 0 ? `(${cv}x)` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase">Accuracy:</span>
          <span className="font-bold text-emerald-400">{Math.round(accuracy)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase">Precision:</span>
          <span className="font-bold text-purple-300">{Math.round(precision ?? accuracy)}%</span>
        </div>
      </div>
    </div>
  );
};
