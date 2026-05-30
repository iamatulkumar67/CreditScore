import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { AppWindow } from "../lib/AppWindow";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

const COMMANDS = ["$ anchor deploy", "$ solana program show"];
const ASCII_LOGO = "  ███████╗██╗  ██╗     ██████╗██████╗ ███████╗██████╗ ██╗████████╗\n  ╚══███╔╝██║ ██╔╝    ██╔════╝██╔══██╗██╔════╝██╔══██╗██║╚══██╔══╝\n    ███╔╝ █████╔╝     ██║     ██████╔╝█████╗  ██║  ██║██║   ██║   \n   ███╔╝  ██╔═██╗     ██║     ██╔══██╗██╔══╝  ██║  ██║██║   ██║   \n  ███████╗██║  ██╗    ╚██████╗██║  ██║███████╗██████╔╝██║   ██║   \n  ╚══════╝╚═╝  ╚═╝     ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝   ╚═╝   ";

const OUTPUTS = [
  { text: "✓ zk-credit-verifier deployed", color: colors.green },
  { text: "✓ zk-lending-pool deployed", color: colors.green },
  { text: "✓ ZKCR token deployed", color: colors.green },
  { text: "✓ zk-governance deployed", color: colors.green },
];

const PROGRAM_IDS = [
  "ZKCv...7xPq",
  "ZKLp...3mNr",
  "4A1A...pump",
  "ZKGv...9dKs",
];

export const Scene1Terminal: React.FC = () => {
  const frame = useCurrentFrame();

  const cmd1Chars = Math.floor(interpolate(frame, [5, 30], [0, COMMANDS[0].length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const cmd2Chars = Math.floor(interpolate(frame, [35, 55], [0, COMMANDS[1].length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const logoOpacity = interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const perspective = interpolate(frame, [0, 20], [3, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />
      <div style={{ transform: `perspective(1200px) rotateX(${perspective}deg)` }}>
        <AppWindow title="Terminal — zk-credit">
          <div style={{ padding: 20, fontFamily: fonts.mono, fontSize: 13, color: colors.white, lineHeight: 1.8 }}>
            <div style={{ color: colors.cyan }}>{COMMANDS[0].slice(0, cmd1Chars)}<span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>▌</span></div>
            {frame > 30 && (
              <pre style={{ color: colors.solanaGreen, fontSize: 9, margin: "8px 0", opacity: logoOpacity, lineHeight: 1.1 }}>{ASCII_LOGO}</pre>
            )}
            {frame > 35 && <div style={{ color: colors.cyan, marginTop: 8 }}>{COMMANDS[1].slice(0, cmd2Chars)}</div>}
            {OUTPUTS.map((out, i) => {
              const showAt = 55 + i * 12;
              const op = interpolate(frame, [showAt, showAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ opacity: op, color: out.color, display: "flex", justifyContent: "space-between" }}>
                  <span>{out.text}</span>
                  <span style={{ color: colors.muted, fontSize: 11 }}>{PROGRAM_IDS[i]}</span>
                </div>
              );
            })}
          </div>
        </AppWindow>
      </div>
    </AbsoluteFill>
  );
};
