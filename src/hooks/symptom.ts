import { useMemo } from "react";
import { useStore } from "../config/store";
import { getSymptomValueById } from "../lib/symptoms";
import { ISymptom } from "../types/interfaces";

export function useSymptomValue<T>(sid: string) {
  const symptoms = useStore((s) => s.symptoms);
  const value: T | undefined = useMemo(() => getSymptomValueById(symptoms, sid), [sid, symptoms]);
  return value;
}

export function useSymptomValueOf<T>(symptoms: ISymptom[], sid: string) {
  const value: T | undefined = useMemo(() => getSymptomValueById(symptoms, sid), [sid, symptoms]);
  return value;
}
