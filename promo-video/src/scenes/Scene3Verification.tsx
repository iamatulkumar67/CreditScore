import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { AppWindow } from "../lib/AppWindow";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const STEPS = ["Raw Data", "ZK Proof", "Verification Engine", "Credential (SBT)"];

export const Scene3Verification: React.FC = () => {
  const frame = useCurrentFrame();

  const claimOp = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />
      <AppWindow title="ZK Verification Flow">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 30 }}>
          {/* Claim */}
          <div style={{ opacity: claimOp, background: colors.bg, border: `1px solid ${colors.cyan}`, borderRadius: 12, padding: "12px 24px", marginBottom: 30 }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.cyan }}>claim: </span>
            <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.white }}>"My score &gt; 750"</span>
          </div>

          {/* Flow steps */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {STEPS.map((step, i) => {
              const delay = 30 + i * 25;
              const op = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const scale = interpolate(frame, [delay, delay + 15], [0.8, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <React.Fragment key={i}>
                  <div style={{ opacity: op, transform: `scale(${scale})`, background: i === 3 ? `${colors.green}20` : colors.bg, border: `1px solid ${i === 3 ? colors.green : colors.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center", minWidth: 120 }}>
                    <div style={{ fontFamily: fonts.inter, fontSize: 11, color: i === 3 ? colors.green : colors.white, fontWeight: 600 }}>{step}</div>
                  </div>
                  {i < 3 && <div style={{ opacity: op, color: colors.cyan, fontSize: 18 }}>→</div>}
                </React.Fragment>
              );
            })}
          </div>

          {/* Verification result */}
          {frame > 120 && (
            <div style={{
              marginTop: 30,
              opacity: interpolate(frame, [120, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <div style={{ fontSize: 40, color: colors.green }}>✓</div>
              <div style={{ fontFamily: fonts.inter, fontSize: 16, color: colors.green, fontWeight: 700 }}>Tier 3 — VERIFIED</div>
              {/* Shield glow */}
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: `radial-gradient(circle, ${colors.cyan}30, transparent)`,
                boxShadow: `0 0 30px ${colors.cyan}40`,
                opacity: interpolate(frame, [135, 170], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }} />
            </div>
          )}
        </div>
      </AppWindow>
    </AbsoluteFill>
  );
};
