import { useMemo } from "react";
import { useBufferStore } from "../config/store";
import { getSymptomValueById } from "../lib/symptoms";
import { ISymptom } from "../types";

export function useSymptomValue<T>(sid: string): T | undefined {
  const symptoms = useBufferStore((s) => s.symptoms);
  const value = useMemo(() => getSymptomValueById(symptoms, sid), [sid, symptoms]);
  return value as never;
}

export function useSymptomValueOf<T>(symptoms: ISymptom[], sid: string): T | undefined {
  const value = useMemo(() => getSymptomValueById<T>(symptoms, sid), [sid, symptoms]);
  return value as never;
}
