import React from "react";
import { useVideoConfig, interpolate, staticFile, Sequence } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Terminal } from "./scenes/Scene1Terminal";
import { Scene2Home } from "./scenes/Scene2Home";
import { Scene3Verification } from "./scenes/Scene3Verification";
import { Scene4Lending } from "./scenes/Scene4Lending";
import { Scene5AI } from "./scenes/Scene5AI";
import { Scene6Token } from "./scenes/Scene6Token";
import { Scene7Governance } from "./scenes/Scene7Governance";
import { Scene8CTA } from "./scenes/Scene8CTA";

const TRANSITION_DURATION = 15;

export const ZKCreditPromo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <>
      {/* Background music — 1s fade-in, 2s fade-out, 40% volume */}
      <Sequence from={0} layout="none">
        <Audio
          src={staticFile("bgm.mp3")}
          volume={(f) => {
            const fadeIn = interpolate(f, [0, fps], [0, 0.4], { extrapolateRight: "clamp" });
            const fadeOut = interpolate(f, [durationInFrames - 2 * fps, durationInFrames], [0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return Math.min(fadeIn, fadeOut);
          }}
        />
      </Sequence>

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene1Terminal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Home />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene3Verification />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene4Lending />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene5AI />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene6Token />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene7Governance />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene8CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
