import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { AppWindow } from "../lib/AppWindow";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const CARDS = [
  { title: "Credit Verification", icon: "🛡️", color: colors.cyan },
  { title: "AI Risk Analytics", icon: "🧠", color: colors.purple },
  { title: "On-Chain Reputation", icon: "⭐", color: colors.solanaGreen },
  { title: "Connect Wallet", icon: "👛", color: colors.solanaPurple },
];

export const Scene2Home: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [10, 30], [20, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleOp = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />
      <AppWindow title="zkScore.credit">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 40 }}>
          <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, fontFamily: fonts.serif, fontSize: 48, fontWeight: 700, color: colors.white, textAlign: "center" }}>
            ZK CREDIT
          </div>
          <div style={{ opacity: subtitleOp, fontFamily: fonts.inter, fontSize: 18, color: colors.cyan, marginTop: 8, fontWeight: 600 }}>
            Privacy-First Credit Intelligence
          </div>
          <div style={{ opacity: tagOp, fontFamily: fonts.inter, fontSize: 14, color: colors.muted, marginTop: 12, textAlign: "center", maxWidth: 400 }}>
            "Prove trustworthiness without exposing financial data."
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap", justifyContent: "center" }}>
            {CARDS.map((card, i) => {
              const delay = 60 + i * 15;
              const op = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const y = interpolate(frame, [delay, delay + 15], [20, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ opacity: op, transform: `translateY(${y}px)`, background: colors.bg, border: `1px solid ${card.color}40`, borderRadius: 12, padding: "16px 20px", width: 180, textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{card.icon}</div>
                  <div style={{ fontFamily: fonts.inter, fontSize: 12, color: colors.white, marginTop: 8, fontWeight: 600 }}>{card.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AppWindow>
    </AbsoluteFill>
  );
};
