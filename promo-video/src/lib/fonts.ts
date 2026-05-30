import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRobotoMono } from "@remotion/google-fonts/RobotoMono";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

const { fontFamily: monoFamily } = loadRobotoMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const fonts = {
  inter: interFamily,
  mono: monoFamily,
  serif: "Georgia, serif",
};
