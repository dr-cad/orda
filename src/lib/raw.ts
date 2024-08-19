import { IDisease, ISymptom } from "../types";
import { decode } from "./base64";

// ssg encoding for sensetive data + validation on compile time

const emptySymptoms: ISymptom[] = import.meta.compileTime<any>("./get-symptoms.ts");
const emptyDiseasesEncoded = import.meta.compileTime<string>("./get-diseases.ts");
const emptyDiseases: IDisease[] = decode(emptyDiseasesEncoded);

export { emptyDiseases, emptySymptoms };
