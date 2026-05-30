import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { AppWindow } from "../lib/AppWindow";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const PANELS = [
  { title: "AI Risk Analysis", icon: "🧠", value: "Low Risk" },
  { title: "Wallet Behavior", icon: "👛", value: "Active 2yr+" },
  { title: "Transaction Patterns", icon: "📊", value: "Consistent" },
  { title: "Reputation Signals", icon: "⭐", value: "Strong" },
];

export const Scene5AI: React.FC = () => {
  const frame = useCurrentFrame();

  const scoreValue = Math.floor(interpolate(frame, [60, 110], [0, 847], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const confidenceValue = Math.floor(interpolate(frame, [80, 120], [0, 94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />
      <AppWindow title="AI Intelligence Engine">
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 24 }}>
          {/* Cards grid */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {PANELS.map((p, i) => {
              const delay = 10 + i * 15;
              const op = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const y = interpolate(frame, [delay, delay + 12], [15, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ opacity: op, transform: `translateY(${y}px)`, flex: "1 1 45%", background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <span style={{ fontFamily: fonts.inter, fontSize: 12, color: colors.muted, fontWeight: 600 }}>{p.title}</span>
                  </div>
                  <div style={{ fontFamily: fonts.inter, fontSize: 16, color: colors.white, fontWeight: 700, marginTop: 8 }}>{p.value}</div>
                </div>
              );
            })}
          </div>

          {/* Score display */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, marginTop: 30 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 42, color: colors.cyan, fontWeight: 700 }}>{scoreValue}</div>
              <div style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.muted }}>Credit Score</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 42, color: colors.green, fontWeight: 700 }}>{confidenceValue}%</div>
              <div style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.muted }}>Confidence</div>
            </div>
          </div>

          <div style={{
            textAlign: "center", marginTop: 20,
            opacity: interpolate(frame, [110, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <span style={{ fontFamily: fonts.inter, fontSize: 13, color: colors.purple, fontWeight: 600 }}>
              "AI models + On-chain signals."
            </span>
          </div>
        </div>
      </AppWindow>
    </AbsoluteFill>
  );
};
