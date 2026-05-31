import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, EASE_OUT, EASE_IN_OUT, GridBackground, FadeText, FONT } from "../lib/styles";

export const Scene5Beta: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow zoom on background
  const zoom = interpolate(frame, [0, 180], [1, 1.15], {
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });

  // Pulsing glow ring
  const ringScale = interpolate(frame, [40, 70], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const ringOpacity = interpolate(frame, [40, 60, 140, 170], [0, 0.6, 0.6, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse animation for ring
  const pulse = Math.sin(frame * 0.06) * 0.1 + 1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <div style={{ transform: `scale(${zoom})`, position: "absolute", inset: 0 }}>
        <GridBackground opacity={0.1} />
      </div>

      {/* Glow ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${ringScale * pulse})`,
          opacity: ringOpacity,
        }}
      >
        <div
          style={{
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: `2px solid ${COLORS.accent}`,
            boxShadow: `0 0 60px ${COLORS.accent}40, inset 0 0 60px ${COLORS.accent}20`,
          }}
        />
      </div>

      {/* Text content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
        }}
      >
        <FadeText delay={20} duration={25}>
          <p
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: COLORS.text,
              textAlign: "center",
              fontFamily: FONT,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Beta Testing
          </p>
        </FadeText>
        <FadeText delay={35} duration={25}>
          <p
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: COLORS.accentLight,
              textAlign: "center",
              fontFamily: FONT,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginTop: 8,
            }}
          >
            is Coming
          </p>
        </FadeText>

        <FadeText delay={80} duration={25}>
          <p
            style={{
              fontSize: 40,
              fontWeight: 400,
              color: COLORS.textMuted,
              textAlign: "center",
              fontFamily: FONT,
              marginTop: 60,
            }}
          >
            Be Among the First Users
          </p>
        </FadeText>
      </div>
    </AbsoluteFill>
  );
};
