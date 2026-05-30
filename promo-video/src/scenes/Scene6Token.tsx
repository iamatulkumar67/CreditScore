import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { AppWindow } from "../lib/AppWindow";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const FEATURES = ["Staking", "Rewards", "Fee Discounts", "Governance Power"];

export const Scene6Token: React.FC = () => {
  const frame = useCurrentFrame();

  const tokenScale = interpolate(frame, [5, 25], [0, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowOp = interpolate(frame, [15, 40], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />
      <AppWindow title="ZKCR Token">
        <div style={{ display: "flex", height: "100%", padding: 30, alignItems: "center" }}>
          {/* Token visual */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              transform: `scale(${tokenScale})`,
              width: 120, height: 120, borderRadius: "50%",
              background: `conic-gradient(${colors.cyan}, ${colors.purple}, ${colors.solanaGreen}, ${colors.cyan})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 ${40 * glowOp}px ${colors.cyan}60`,
            }}>
              <div style={{ width: 100, height: 100, borderRadius: "50%", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: fonts.inter, fontSize: 20, fontWeight: 800, color: colors.cyan }}>ZKCR</span>
              </div>
            </div>
            <div style={{
              marginTop: 16, fontFamily: fonts.mono, fontSize: 9, color: colors.muted,
              opacity: interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              4A1AR7H5VHQzwM7QuucYDHKTrQWt9HQ1GyEB4gh4pump
            </div>
          </div>

          {/* Features */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {FEATURES.map((f, i) => {
              const delay = 35 + i * 12;
              const op = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const x = interpolate(frame, [delay, delay + 10], [20, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ opacity: op, transform: `translateX(${x}px)`, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: colors.green, fontSize: 16 }}>✓</span>
                  <span style={{ fontFamily: fonts.inter, fontSize: 15, color: colors.white, fontWeight: 600 }}>{f}</span>
                </div>
              );
            })}

            {/* Staking graph */}
            <div style={{
              marginTop: 16, height: 60, background: colors.bg, borderRadius: 8, border: `1px solid ${colors.border}`, overflow: "hidden", position: "relative",
              opacity: interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <svg width="100%" height="60" viewBox="0 0 200 60">
                <path
                  d={`M0,55 Q50,${55 - interpolate(frame, [85, 120], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 100,${55 - interpolate(frame, [90, 120], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} T200,${55 - interpolate(frame, [95, 120], [0, 45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}`}
                  fill="none" stroke={colors.solanaGreen} strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </AppWindow>
    </AbsoluteFill>
  );
};
