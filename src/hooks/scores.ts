import { useMemo } from "react";
import { IScoredDisease } from "../types/interfaces";
import { AppMode, BarDatum, Keys } from "./../types/interfaces";

export default function useScores(scores: IScoredDisease[], mode = AppMode.Raw, limit = 5) {
  const output = useMemo(
    () =>
      [...scores]
        .sort((a, b) => {
          if (mode === AppMode.Raw) return b.value - a.value;
          return b.pvalue - a.pvalue;
        })
        .slice(0, limit),
    [scores, limit, mode]
  );

  const barChartData: BarDatum[] = useMemo(
    () =>
      output.map<BarDatum>((score) => ({
        [Keys.title]: score.name,
        [Keys.raw]: score.value,
        [Keys.pval]: score.pvalue,
      })),
    [output]
  );

  return { scores: output, barChartData };
}
