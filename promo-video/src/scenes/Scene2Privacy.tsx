import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, EASE_OUT, GridBackground, FadeText, FONT } from "../lib/styles";

export const Scene2Privacy: React.FC = () => {
  const frame = useCurrentFrame();

  // Data stream particles flowing upward
  const particles = Array.from({ length: 20 }, (_, i) => {
    const speed = 2 + (i % 5) * 0.5;
    const x = 100 + (i * 47) % 880;
    const startY = 1920 + (i * 130) % 600;
    const y = startY - frame * speed;
    const opacity = interpolate(
      y,
      [0, 600, 1400, 1920],
      [0, 0.7, 0.7, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    return { x, y: y % 2200, opacity, size: 2 + (i % 3) };
  });

  // Lock icon scale
  const lockScale = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <GridBackground opacity={0.08} />

      {/* Data flow particles */}
      <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
        {particles.map((p, i) => (
          <rect
            key={i}
            x={p.x}
            y={((p.y % 1920) + 1920) % 1920}
            width={p.size}
            height={12 + i % 8}
            rx={1}
            fill={i % 3 === 0 ? COLORS.accent : COLORS.green}
            opacity={p.opacity}
          />
        ))}
      </svg>

      {/* Shield / Lock icon */}
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${lockScale})`,
          opacity: lockScale,
        }}
      >
        <svg width={120} height={140} viewBox="0 0 24 28" fill="none">
          <path
            d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6L12 2z"
            fill={COLORS.accent}
            opacity={0.2}
          />
          <path
            d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6L12 2z"
            stroke={COLORS.accentLight}
            strokeWidth={1.5}
            fill="none"
          />
          <rect x={9} y={11} width={6} height={5} rx={1} fill={COLORS.accentLight} />
          <path d="M10 11V9a2 2 0 014 0v2" stroke={COLORS.accentLight} strokeWidth={1.5} fill="none" />
        </svg>
      </div>

      {/* Text */}
      <div
        style={{
          position: "absolute",
          bottom: 500,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        <FadeText delay={30} duration={20}>
          <p
            style={{
              fontSize: 52,
              fontWeight: 600,
              color: COLORS.text,
              textAlign: "center",
              fontFamily: FONT,
              lineHeight: 1.4,
            }}
          >
            Your credit reputation.
          </p>
        </FadeText>
        <FadeText delay={55} duration={20}>
          <p
            style={{
              fontSize: 52,
              fontWeight: 600,
              color: COLORS.accentLight,
              textAlign: "center",
              fontFamily: FONT,
              lineHeight: 1.4,
              marginTop: 20,
            }}
          >
            Your privacy.
          </p>
        </FadeText>
      </div>
    </AbsoluteFill>
  );
};
