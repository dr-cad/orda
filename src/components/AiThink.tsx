import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import aiThink from "../assets/ai-think.json";

export const frames = 297; // for sake of performance
const DEFAULT_SPEED = 0.5;
const PROC_SPEED = 2;

interface IProps {
  loading: boolean;
}

export interface IAiThinkRef {
  nextLoop: () => void;
}

export interface BMCompleteEvent {
  direction: number;
  type: "complete";
}

export interface BMCompleteLoopEvent {
  currentLoop: number;
  direction: number;
  totalLoops: number;
  type: "loopComplete";
}

export interface BMDestroyEvent {
  type: "destroy";
}

export interface BMEnterFrameEvent {
  /** The current time in frames. */
  currentTime: number;
  direction: number;
  /** The total number of frames. */
  totalTime: number;
  type: "enterFrame";
}

const AiThink = forwardRef<IAiThinkRef, IProps>(function AiThink({ loading }, ref) {
  const lottie = useRef<LottieRefCurrentProps>(null!);

  useImperativeHandle(ref, () => ({
    nextLoop() {
      lottie.current.setSpeed(PROC_SPEED);
      lottie.current.animationItem?.addEventListener("loopComplete", () => {
        lottie.current.setSpeed(DEFAULT_SPEED);
      });
    },
  }));

  useEffect(() => {
    const dur = lottie.current.getDuration();
    if (typeof dur === "undefined") return;
    if (loading) lottie.current.setSpeed(PROC_SPEED);
    else lottie.current.setSpeed(DEFAULT_SPEED);
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
});

export default AiThink;
