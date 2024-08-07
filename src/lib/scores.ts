import { IDisease, IDiseaseFactor, IScoredDisease, ISymptom } from "../types/interfaces";
import _ from "lodash";

interface IProps {
  symptoms: ISymptom[];
  diseases: IDisease[];
}

export const epsilon = 0.01; // NOTICE lower number may cause NaN issue
const inactive = epsilon; // any fucking number - no matter
const manipulateRate = (rate: number) => (rate === -1 ? epsilon : rate);

const getSymptomProbablity = (factor: IDiseaseFactor, symptoms: ISymptom[]) => {
  // This will check if ranges-array exists and sort them by their rate
  const dfranges = factor.ranges ? _.orderBy(factor.ranges, (a) => manipulateRate(a.rate), "desc") : null; // dfranges = disease factor ranges

  for (const symptom of symptoms) {
    if (symptom.id === factor.sid) {
      switch (symptom.type) {
        case "range":
          if (!Array.isArray(dfranges)) return 1;
          for (let range of dfranges) {
            if (
              typeof symptom.value !== "object" ||
              // Array.isArray(symptom.value) ||
              symptom.value instanceof Date ||
              !symptom.value ||
              !symptom.value.a ||
              !symptom.value.b
            ) {
              console.error(
                `Type mismatch for symptom.value ${symptom.id} expected range but got ${typeof symptom.value}`,
                symptom.value
              );
              return inactive;
            }
            if (symptom.value.a >= range.a && symptom.value.b <= range.b) {
              return manipulateRate(range.rate);
            }
          }
          return inactive; // TODO
        case "number":
          if (!Array.isArray(dfranges)) return 1;
          for (let range of dfranges) {
            if ((symptom.value! as number) >= range.a && (symptom.value! as number) <= range.b) {
              return manipulateRate(range.rate);
            }
          }
          return inactive;
        default:
          if (symptom.value) return manipulateRate(factor.rate!);
          return inactive;
      }
    }
  }

  console.error("Couldn't find factor", factor.sid);
  return 1;
};

// nominator
const getDiseaseProbablity = (disease: IDisease, symptoms: ISymptom[]): number => {
  console.groupCollapsed("Disease", disease.name);
  const mul = disease.factors.reduce((v, factor) => v * getSymptomProbablity(factor, symptoms), 1);
  console.groupEnd();
  return mul; // P(Di) * ∏j{P(Sj|Di)}
};

export default function getScores({ diseases, symptoms }: IProps): IScoredDisease[] {
  const nominators: number[] = diseases.map((disease) => getDiseaseProbablity(disease, symptoms));
  const dinaminator = nominators.reduce((a, b) => a + b, 0); // Σi{P(Di)} * ∏j{P(Sj|Di)}
  const pnominators: number[] = diseases.map((disease) => disease.preval * getDiseaseProbablity(disease, symptoms));
  const pdinaminator = pnominators.reduce((a, b) => a + b, 0); // Σi{P(Di)} * ∏j{P(Sj|Di)}
  return diseases.map((disease, i) => ({
    ...disease,
    value: nominators[i] / dinaminator,
    pvalue: pnominators[i] / pdinaminator,
  }));
}
