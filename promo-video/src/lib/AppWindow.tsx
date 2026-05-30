import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { colors } from "./theme";

export const AppWindow: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title = "" }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 15], [0.92, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        width: 960,
        height: 580,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${colors.cyan}15`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 36,
          background: "#0a0f1a",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 8,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        {title && (
          <span
            style={{
              marginLeft: 12,
              color: colors.muted,
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {title}
          </span>
        )}
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
    </div>
  );
};
