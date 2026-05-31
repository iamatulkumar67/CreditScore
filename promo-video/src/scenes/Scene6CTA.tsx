import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, EASE_OUT, GridBackground, FadeText, FONT } from "../lib/styles";

export const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();

  // Button pulse
  const pulse = Math.sin(frame * 0.08) * 0.03 + 1;

  // Logo scale in
  const logoScale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const logoOpacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <GridBackground opacity={0.05} />

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
        {/* Logo placeholder */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 60,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", fontFamily: FONT }}>
              ZK
            </span>
          </div>
        </div>

        {/* Main CTA */}
        <FadeText delay={15} duration={22}>
          <p
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.text,
              textAlign: "center",
              fontFamily: FONT,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Join the Beta
          </p>
        </FadeText>
        <FadeText delay={25} duration={22}>
          <p
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: COLORS.accentLight,
              textAlign: "center",
              fontFamily: FONT,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Waitlist
          </p>
        </FadeText>

        {/* Subtext */}
        <FadeText delay={55} duration={20}>
          <p
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: COLORS.textMuted,
              textAlign: "center",
              fontFamily: FONT,
              marginTop: 40,
              lineHeight: 1.6,
            }}
          >
            Early access • Exclusive rewards • Shape the future
          </p>
        </FadeText>

        {/* CTA Button */}
        <FadeText delay={80} duration={20}>
          <div
            style={{
              marginTop: 60,
              transform: `scale(${pulse})`,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
              borderRadius: 16,
              padding: "20px 48px",
            }}
          >
            <p
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: "#fff",
                fontFamily: FONT,
              }}
            >
              zkscore.credit
            </p>
          </div>
        </FadeText>
      </div>
    </AbsoluteFill>
  );
};
