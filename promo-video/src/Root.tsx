import { Composition } from "remotion";
import { ZKCreditPromo } from "./ZKCreditPromo";

// 8 scenes: 120+150+170+140+140+120+160+160 = 1160 frames
// 7 transitions of 15 frames each = -105 frames
// Total: 1160 - 105 = 1055 frames (~35s at 30fps)
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ZKCreditPromo"
      component={ZKCreditPromo}
      durationInFrames={1055}
      fps={30}
      width={1080}
      height={700}
    />
  );
};
