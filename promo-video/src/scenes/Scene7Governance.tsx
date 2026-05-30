import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { Background } from "../lib/Background";
import { AppWindow } from "../lib/AppWindow";
import { colors } from "../lib/theme";
import { fonts } from "../lib/fonts";

export const Scene7Governance: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOp = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const voteFor = interpolate(frame, [40, 100], [0, 72], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const voteAgainst = interpolate(frame, [50, 100], [0, 28], { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const timelockVal = Math.max(0, Math.floor(interpolate(frame, [100, 150], [48, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Background />
      <AppWindow title="DAO Governance">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 30 }}>
          {/* Proposal card */}
          <div style={{ opacity: cardOp, background: colors.bg, border: `1px solid ${colors.purple}60`, borderRadius: 12, padding: 20, width: "80%", maxWidth: 500 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.purple, fontWeight: 600, background: `${colors.purple}20`, padding: "4px 10px", borderRadius: 6 }}>PROPOSAL #42</span>
              <span style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.green }}>Active</span>
            </div>
            <div style={{ fontFamily: fonts.inter, fontSize: 18, color: colors.white, fontWeight: 700, marginTop: 12 }}>
              "Reduce protocol fees"
            </div>

            {/* Voting bars */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.green }}>For</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.green }}>{Math.floor(voteFor)}%</span>
              </div>
              <div style={{ height: 8, background: `${colors.border}60`, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${voteFor}%`, height: "100%", background: colors.green, borderRadius: 4 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, marginTop: 10 }}>
                <span style={{ fontFamily: fonts.inter, fontSize: 11, color: "#ef4444" }}>Against</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 11, color: "#ef4444" }}>{Math.floor(voteAgainst)}%</span>
              </div>
              <div style={{ height: 8, background: `${colors.border}60`, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${voteAgainst}%`, height: "100%", background: "#ef4444", borderRadius: 4 }} />
              </div>
            </div>

            {/* Timelock */}
            <div style={{
              marginTop: 16, textAlign: "center",
              opacity: interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.muted }}>Timelock: </span>
              <span style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.cyan, fontWeight: 700 }}>{timelockVal}h remaining</span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{
            marginTop: 24,
            opacity: interpolate(frame, [130, 145], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <span style={{ fontFamily: fonts.inter, fontSize: 14, color: colors.purple, fontWeight: 600 }}>
              Community-driven protocol governance.
            </span>
          </div>
        </div>
      </AppWindow>
    </AbsoluteFill>
  );
};
