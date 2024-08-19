import _ from "lodash";
import { IDisease, IDiseaseFactor, IDiseaseScored, ISymptom } from "../types";
import { calc } from "./utils";

interface IProps {
  symptoms: ISymptom[];
  diseases: IDisease[];
}

export const epsilon = 0.01; // NOTICE lower number may cause NaN issue
const inactive = epsilon; // any fucking number - no matter
const getRate = (rate: number) => (rate === -1 ? epsilon : rate);

const getSymptomProbablity = (factor: IDiseaseFactor, symptoms: ISymptom[]) => {
  // This will check if ranges-array exists and sort them by their rate
  const dfranges = factor.ranges ? _.orderBy(factor.ranges, (a) => getRate(a.rate), "desc") : null; // dfranges = disease factor ranges

  for (const symptom of symptoms) {
    if (symptom.id === factor.sid) {
      switch (symptom.type) {
        case "range":
          if (!Array.isArray(dfranges)) return 1;
          for (const range of dfranges) {
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
              return getRate(range.rate);
            }
          }
          return inactive; // TODO
        case "number":
          if (!Array.isArray(dfranges)) return 1;
          for (const range of dfranges) {
            if ((symptom.value! as number) >= range.a && (symptom.value! as number) <= range.b) {
              return getRate(range.rate);
            }
          }
          return inactive;
        default:
          if (symptom.value) return getRate(factor.rate!);
          return inactive;
      }
    }
  }

  console.error("Couldn't find factor", factor.sid);
  return 1;
};

const FIX_FRAC = 100;
// const FIX_FRAC = 1;

// nominator
const getDiseaseProbablity = (disease: IDisease, symptoms: ISymptom[]): number => {
  console.groupCollapsed("Disease", disease.name);
  const mul = disease.factors.reduce((v, factor) => v * getSymptomProbablity(factor, symptoms) * FIX_FRAC, 1);
  console.groupEnd();
  return mul; // P(Di) * ∏j{P(Sj|Di)}
};

const getDiseaseProbablity_FIX_FRAC = (disease: IDisease, symptoms: ISymptom[]): number =>
  getDiseaseProbablity(disease, symptoms) * FIX_FRAC;

export default function getScores({ diseases, symptoms }: IProps): IDiseaseScored[] {
  const nominators: number[] = diseases.map((disease) => getDiseaseProbablity_FIX_FRAC(disease, symptoms));
  const dinaminator = nominators.reduce((a, b) => calc(a + b), 0); // Σi{P(Di)} * ∏j{P(Sj|Di)}
  const pnominators: number[] = diseases.map((disease) =>
    calc(disease.preval * getDiseaseProbablity_FIX_FRAC(disease, symptoms))
  );
  const pdinaminator = pnominators.reduce((a, b) => calc(a + b), 0); // Σi{P(Di)} * ∏j{P(Sj|Di)}
  console.log({ nominators, dinaminator, pnominators, pdinaminator });
  return diseases.map((disease, i) => ({
    ...disease,
    value: calc(nominators[i] / dinaminator),
    pvalue: calc(pnominators[i] / pdinaminator),
  }));
}
