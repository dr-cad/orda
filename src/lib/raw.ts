import { IDisease, ISymptom } from "../types/interfaces";
import { decode } from "./base64";

const rawSymptoms: ISymptom[] = import.meta.compileTime<any>("./get-symptoms.ts");
const rawDiseasesEncoded = import.meta.compileTime<string>("./get-diseases.ts");
const rawDiseases: IDisease[] = decode(rawDiseasesEncoded);

export { rawDiseases, rawSymptoms };
