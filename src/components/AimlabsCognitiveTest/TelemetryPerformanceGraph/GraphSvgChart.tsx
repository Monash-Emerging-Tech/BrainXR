import React from "react";
import type { TargetTelemetryRecord } from "../types";
import { computeChartSeries } from "./chartSeries";

interface GraphSvgChartProps {
  data: TargetTelemetryRecord[];
  count: number;
  meanRT: number;
  sdRT: number;
  splitIndex: number;
}

export const GraphSvgChart: React.FC<GraphSvgChartProps> = ({ data, count, meanRT, sdRT, splitIndex }) => {
  const {
    W,
    H,
    padL,
    padR,
    padT,
    innerH,
    getYForRT,
    getYForAcc,
    getX,
    outerBandPolygon,
    innerBandPolygon,
    whiskerTopLine,
    whiskerBottomLine,
    accPoints,
    movingAvgPoints,
    xSplit,
  } = computeChartSeries(data, count, meanRT, sdRT, splitIndex);

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
};
