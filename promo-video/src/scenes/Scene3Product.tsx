import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, EASE_OUT, GridBackground, FadeText, FONT } from "../lib/styles";

export const Scene3Product: React.FC = () => {
  const frame = useCurrentFrame();

  // Dashboard card slide up
  const cardY = interpolate(frame, [10, 40], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const cardOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Score arc animation
  const scoreProgress = interpolate(frame, [30, 80], [0, 0.78], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  const scoreValue = Math.round(scoreProgress * 850);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <GridBackground opacity={0.06} />

      {/* Dashboard mockup */}
      <div
        style={{
          position: "absolute",
          top: 350,
          left: 80,
          right: 80,
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}
      >
        {/* Card */}
        <div
          style={{
            background: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            padding: "60px 50px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Score arc */}
          <svg width={300} height={180} viewBox="0 0 300 180">
            {/* Background arc */}
            <path
              d="M 30 170 A 120 120 0 0 1 270 170"
              fill="none"
              stroke={COLORS.border}
              strokeWidth={12}
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 30 170 A 120 120 0 0 1 270 170"
              fill="none"
              stroke={COLORS.green}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={`${scoreProgress * 377} 377`}
            />
          </svg>
          {/* Score number */}
          <p
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: COLORS.text,
              fontFamily: FONT,
              marginTop: -60,
            }}
          >
            {scoreValue}
          </p>
          <p
            style={{
              fontSize: 24,
              color: COLORS.textMuted,
              fontFamily: FONT,
              marginTop: 8,
            }}
          >
            ZK Credit Score
          </p>

          {/* Verification badge */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(16, 185, 129, 0.1)",
              border: `1px solid ${COLORS.green}40`,
              borderRadius: 12,
              padding: "12px 24px",
              opacity: interpolate(frame, [60, 80], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill={COLORS.green}>
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            <span style={{ color: COLORS.green, fontSize: 22, fontFamily: FONT }}>
              ZK Verified
            </span>
          </div>
        </div>
      </div>

      {/* Feature text list */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <FadeText delay={60} duration={18}>
          <p style={{ fontSize: 38, fontWeight: 600, color: COLORS.text, fontFamily: FONT }}>
            ZK Credit Verification
          </p>
        </FadeText>
        <FadeText delay={80} duration={18}>
          <p style={{ fontSize: 34, fontWeight: 400, color: COLORS.textMuted, fontFamily: FONT }}>
            Privacy-Preserving Reputation
          </p>
        </FadeText>
        <FadeText delay={100} duration={18}>
          <p style={{ fontSize: 34, fontWeight: 400, color: COLORS.textMuted, fontFamily: FONT }}>
            On-Chain Credit Infrastructure
          </p>
        </FadeText>
      </div>
    </AbsoluteFill>
  );
};
