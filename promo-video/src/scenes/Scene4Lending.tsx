import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { AppWindow } from "../lib/AppWindow";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const TIERS = [
  { tier: "Tier 0", ratio: "150%", color: colors.muted },
  { tier: "Tier 1", ratio: "110%", color: colors.white },
  { tier: "Tier 2", ratio: "80%", color: colors.cyan },
  { tier: "Tier 3", ratio: "60%", color: colors.solanaGreen },
  { tier: "Tier 4", ratio: "50%", color: colors.green },
];

export const Scene4Lending: React.FC = () => {
  const frame = useCurrentFrame();

  const tradOp = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zkOp = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />
      <AppWindow title="Lending Comparison">
        <div style={{ display: "flex", height: "100%", padding: 30, gap: 24 }}>
          {/* Traditional */}
          <div style={{ flex: 1, opacity: tradOp, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `${colors.bg}`, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: fonts.inter, fontSize: 14, color: colors.muted, fontWeight: 600 }}>Traditional DeFi</div>
            <div style={{ fontFamily: fonts.inter, fontSize: 48, color: "#ef4444", fontWeight: 800, marginTop: 12 }}>150%</div>
            <div style={{ fontFamily: fonts.inter, fontSize: 12, color: colors.muted, marginTop: 4 }}>Collateral Required</div>
          </div>

          {/* ZK Credit */}
          <div style={{ flex: 1.5, opacity: zkOp, display: "flex", flexDirection: "column", background: colors.bg, border: `1px solid ${colors.cyan}40`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: fonts.inter, fontSize: 14, color: colors.cyan, fontWeight: 600, textAlign: "center", marginBottom: 16 }}>ZK Credit — Tier-Based</div>
            {TIERS.map((t, i) => {
              const delay = 50 + i * 12;
              const op = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const barW = interpolate(frame, [delay, delay + 15], [0, parseInt(t.ratio)], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ opacity: op, display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, color: t.color, width: 50 }}>{t.tier}</span>
                  <div style={{ flex: 1, height: 16, background: `${colors.border}60`, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(barW / 150) * 100}%`, height: "100%", background: t.color, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, color: t.color, width: 40 }}>{t.ratio}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tagline */}
        <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center" }}>
          <span style={{
            fontFamily: fonts.inter, fontSize: 13, color: colors.cyan, fontWeight: 600,
            opacity: interpolate(frame, [100, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            "Better reputation. Better capital efficiency."
          </span>
        </div>
      </AppWindow>
    </AbsoluteFill>
  );
};
