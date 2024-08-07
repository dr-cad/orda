import { useMemo } from "react";
import { useStore } from "../config/store";
import { getSymptomValueById } from "../lib/symptoms";
import { ISymptom } from "../types/interfaces";

export function useSymptomValue<T>(sid: string): T | undefined {
  const symptoms = useStore((s) => s.symptoms);
  const value = useMemo(() => getSymptomValueById(symptoms, sid), [sid, symptoms]);
  return value as never;
}

export function useSymptomValueOf<T>(symptoms: ISymptom[], sid: string): T | undefined {
  const value = useMemo(() => getSymptomValueById(symptoms, sid), [sid, symptoms]);
  return value as never;
}
