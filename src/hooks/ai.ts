import { useNavigate } from "react-router-dom";
import { useBufferStore } from "../store";

export default function useAI() {
  const nav = useNavigate();
  const resetAiInputs = useBufferStore((s) => s.resetAiInputs);
  const handleNewAi = () => {
    resetAiInputs();
    nav("/ai/1");
  };
  return { handleNewAi };
}
