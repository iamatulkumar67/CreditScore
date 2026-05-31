import React from "react";
import { useVideoConfig, interpolate, staticFile, Sequence } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Privacy } from "./scenes/Scene2Privacy";
import { Scene3Product } from "./scenes/Scene3Product";
import { Scene4Features } from "./scenes/Scene4Features";
import { Scene5Beta } from "./scenes/Scene5Beta";
import { Scene6CTA } from "./scenes/Scene6CTA";

const TRANSITION = 12;

// Scene durations (frames at 30fps):
// Scene1: 0-4s = 120f
// Scene2: 4-8s = 120f
// Scene3: 8-13s = 150f
// Scene4: 13-18s = 150f
// Scene5: 18-24s = 180f
// Scene6: 24-30s = 180f
// Total raw: 900f, minus 5 transitions of 12f = 840f effective → adjust durations
// Adjusted: 120+120+150+150+180+180 = 900, transitions overlap = 60, net = 840 → need 900
// So: 120+132+162+162+192+192 = 960 - 60 = 900 ✓
// Simpler: just set total to match with transitions

export const ZKCreditPromo: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <>
      <Sequence from={0} layout="none">
        <Audio
          src={staticFile("bgm1.mp3")}
          volume={(f) => {
            const fadeIn = interpolate(f, [0, fps], [0, 0.35], { extrapolateRight: "clamp" });
            const fadeOut = interpolate(
              f,
              [durationInFrames - 2 * fps, durationInFrames],
              [0.35, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      </Sequence>

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene2Privacy />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene3Product />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene4Features />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene5Beta />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={200}>
          <Scene6CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
