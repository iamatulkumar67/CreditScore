import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { fonts } from "./fonts";

// Color palette
export const COLORS = {
  bg: "#0a0a0f",
  bgCard: "#12121a",
  accent: "#6366f1",
  accentLight: "#818cf8",
  green: "#10b981",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  border: "#1e293b",
};

export const FONT = fonts.inter;

// Shared easing
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.4, 0, 0.2, 1);

// Animated grid background
export const GridBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.15 }) => {
  const frame = useCurrentFrame();
  const offset = frame * 0.3;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.border} 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${offset}px`,
          opacity,
        }}
      />
      {/* Radial vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 30%, ${COLORS.bg} 80%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Fade-in text helper
export const FadeText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, duration = 20, style }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  const y = interpolate(frame, [delay, delay + duration], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
};
