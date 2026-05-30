import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors } from "./theme";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gridOffset = interpolate(frame, [0, 300], [0, 20], {
    extrapolateRight: "extend",
  });

  const particles = Array.from({ length: 20 }, (_, i) => {
    const x = ((i * 137.5) % 100);
    const y = ((i * 73.7 + frame * 0.3) % 110) - 5;
    const size = 2 + (i % 3);
    const op = interpolate((frame + i * 10) % 90, [0, 45, 90], [0.1, 0.5, 0.1], {
      extrapolateRight: "clamp",
    });
    return { x, y, size, op };
  });

  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${colors.border}40 1px, transparent 1px), linear-gradient(90deg, ${colors.border}40 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `0 ${gridOffset}px`,
          opacity: 0.4,
        }}
      />
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 2 === 0 ? colors.cyan : colors.purple,
            opacity: p.op,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
