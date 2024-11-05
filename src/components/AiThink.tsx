import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef } from "react";
import aiThink from "../assets/ai-think.json";

const frames = 297;

interface IProps {
  loading: boolean;
}

export default function AiThink({ loading }: IProps) {
  const lottie = useRef<LottieRefCurrentProps>(null!);

  useEffect(() => {
    const dur = lottie.current.getDuration();
    if (typeof dur === "undefined") return;
    if (loading) {
      lottie.current.setSpeed(2);
      lottie.current.play();
    } else {
      lottie.current.setSpeed(0.25);
      const mid = frames / 2;
      lottie.current.animationItem?.addEventListener("enterFrame", (args) => {
        if (args.currentTime < mid) return;
        lottie.current.pause();
        lottie.current.animationItem?.removeEventListener("enterFrame");
      });
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        lottie.current.animationItem?.removeEventListener("enterFrame");
      };
    }
  }, [loading]);

  return (
    <Lottie
      lottieRef={lottie}
      loop
      animationData={aiThink}
      style={{
        filter: !loading ? "hue-rotate(0deg)" : "hue-rotate(100deg)",
        transition: "filter 2s ease",
      }}
    />
  );
}
