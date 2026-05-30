import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();

  const logoScale = interpolate(frame, [5, 30], [0.5, 1], { easing: Easing.bezier(0.34, 1.56, 0.64, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoOp = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineOp = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [35, 55], [30, 0], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOp = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulseScale = 1 + 0.03 * Math.sin((frame - 110) * 0.15);

  // Converging neon lines
  const lineProgress = interpolate(frame, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />

      {/* Converging lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {[...Array(6)].map((_, i) => {
          const angle = (i * 60) * (Math.PI / 180);
          const startX = 540 + Math.cos(angle) * 600;
          const startY = 350 + Math.sin(angle) * 600;
          const endX = 540 + Math.cos(angle) * 600 * (1 - lineProgress);
          const endY = 350 + Math.sin(angle) * 600 * (1 - lineProgress);
          return (
            <line key={i} x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={i % 2 === 0 ? colors.cyan : colors.purple} strokeWidth="1" opacity={0.5 * lineProgress} />
          );
        })}
      </svg>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
        {/* Logo */}
        <div style={{
          opacity: logoOp, transform: `scale(${logoScale})`,
          fontFamily: fonts.serif, fontSize: 56, fontWeight: 700, color: colors.white,
          textShadow: `0 0 40px ${colors.cyan}60`,
        }}>
          ZK CREDIT
        </div>

        {/* Headline */}
        <div style={{
          opacity: headlineOp, transform: `translateY(${headlineY}px)`,
          fontFamily: fonts.inter, fontSize: 18, color: colors.white, fontWeight: 700,
          textAlign: "center", maxWidth: 600, marginTop: 24, lineHeight: 1.5,
        }}>
          THE FUTURE OF CREDIT DOESN'T NEED FULL DATA EXPOSURE.
        </div>

        {/* Subheadline */}
        <div style={{ opacity: subOp, fontFamily: fonts.inter, fontSize: 14, color: colors.cyan, marginTop: 12, fontWeight: 600 }}>
          Zero-Knowledge + AI + On-Chain Reputation.
        </div>

        {/* Links */}
        <div style={{
          opacity: ctaOp, marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          transform: `scale(${frame > 110 ? pulseScale : 1})`,
        }}>
          <div style={{ fontFamily: fonts.inter, fontSize: 14, color: colors.white }}>🌐 zkscore.credit</div>
          <div style={{ fontFamily: fonts.inter, fontSize: 14, color: colors.muted }}>𝕏 @ZkCreditScore</div>
          <div style={{
            marginTop: 12, padding: "10px 28px", borderRadius: 8,
            background: `linear-gradient(135deg, ${colors.cyan}, ${colors.purple})`,
            fontFamily: fonts.inter, fontSize: 14, color: colors.white, fontWeight: 700,
          }}>
            Follow the build.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
