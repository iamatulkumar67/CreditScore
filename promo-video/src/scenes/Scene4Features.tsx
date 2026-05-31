import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, EASE_OUT, GridBackground, FONT } from "../lib/styles";

const FEATURES = [
  { label: "Credit Verification", icon: "🛡️" },
  { label: "Lending Tiers", icon: "📊" },
  { label: "Governance", icon: "🗳️" },
  { label: "Staking", icon: "💎" },
];

export const Scene4Features: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <GridBackground opacity={0.06} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
          gap: 40,
        }}
      >
        {/* Section title */}
        <p
          style={{
            fontSize: 38,
            fontWeight: 300,
            color: COLORS.textMuted,
            fontFamily: FONT,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 20,
            opacity: interpolate(frame, [0, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Ecosystem
        </p>

        {/* Feature items */}
        {FEATURES.map((feature, i) => {
          const delay = 20 + i * 25;
          const progress = interpolate(frame, [delay, delay + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });

          const checkScale = interpolate(frame, [delay + 10, delay + 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                opacity: progress,
                transform: `translateX(${(1 - progress) * 40}px)`,
                width: "100%",
                maxWidth: 600,
              }}
            >
              {/* Checkmark circle */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  background: `${COLORS.green}20`,
                  border: `2px solid ${COLORS.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transform: `scale(${checkScale})`,
                }}
              >
                <svg width={24} height={24} viewBox="0 0 20 20" fill={COLORS.green}>
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              </div>

              {/* Label */}
              <p
                style={{
                  fontSize: 44,
                  fontWeight: 500,
                  color: COLORS.text,
                  fontFamily: FONT,
                }}
              >
                {feature.label}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
