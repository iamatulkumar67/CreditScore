import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, EASE_OUT, GridBackground, FadeText, FONT } from "../lib/styles";

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle pulse on grid
  const gridOpacity = interpolate(frame, [0, 60, 120], [0, 0.18, 0.12], {
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  // Network nodes animation
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + frame * 0.008;
    const radius = 280 + Math.sin(frame * 0.02 + i) * 40;
    const x = 540 + Math.cos(angle) * radius;
    const y = 960 + Math.sin(angle) * radius;
    const nodeOpacity = interpolate(frame, [i * 5, i * 5 + 20], [0, 0.6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { x, y, opacity: nodeOpacity };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <GridBackground opacity={gridOpacity} />

      {/* Network nodes */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        width={1080}
        height={1920}
      >
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((other, j) => (
            <line
              key={`${i}-${j}`}
              x1={node.x}
              y1={node.y}
              x2={other.x}
              y2={other.y}
              stroke={COLORS.accent}
              strokeWidth={1}
              opacity={Math.min(node.opacity, other.opacity) * 0.3}
            />
          ))
        )}
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={4}
            fill={COLORS.accentLight}
            opacity={node.opacity}
          />
        ))}
      </svg>

      {/* Text */}
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
        <FadeText delay={15} duration={25}>
          <p
            style={{
              fontSize: 56,
              fontWeight: 300,
              color: COLORS.text,
              textAlign: "center",
              lineHeight: 1.4,
              letterSpacing: "-0.02em",
              fontFamily: FONT,
            }}
          >
            Building the Future of
          </p>
        </FadeText>
        <FadeText delay={35} duration={25}>
          <p
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: COLORS.accentLight,
              textAlign: "center",
              lineHeight: 1.3,
              letterSpacing: "-0.03em",
              fontFamily: FONT,
              marginTop: 12,
            }}
          >
            Privacy-First Credit
          </p>
        </FadeText>
      </div>
    </AbsoluteFill>
  );
};
