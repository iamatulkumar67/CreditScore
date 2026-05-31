import { Composition } from "remotion";
import { ZKCreditPromo } from "./ZKCreditPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ZKCreditPromo"
      component={ZKCreditPromo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
