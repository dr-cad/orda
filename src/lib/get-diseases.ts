import rawDiseases from "../data/diseases.ts";
import { IDisease } from "../types/index.ts";
import { encode } from "./base64.ts";
import getSymptoms from "./get-symptoms.ts";

const rawSymptoms = getSymptoms().data;

function getDiseases() {
  const data: IDisease[] = rawDiseases;

  const validate = () => {
    const idRepo: string[] = [];
    for (const item of data) {
      if (!item.id) {
        throw { item, message: "No Id defined" };
      }
      if (/[A-Z]/.test(item.id)) {
        throw { item, message: "Id includes Uppercase!" };
      }
      if (item.id.includes(" ")) {
        throw {
          item,
          message: "Id includes Space letter, consider using '-' instead",
        };
      }

      if (idRepo.includes(item.id)) {
        throw { item, message: "Duplicate id found: " + item.id };
      }

      idRepo.push(item.id);

      if (item.factors) {
        for (const factor of item.factors) {
          if (!rawSymptoms.find((x) => x.id === factor.sid)) {
            throw {
              item,
              message: "Couldnt find factor with Id: " + factor.sid,
            };
          }
        }
      }
    }
  };

  try {
    validate();
  } catch (error) {
    console.log("Diseases data not valid", error);
    return [];
  }
  return data;
}

export default () => ({ data: encode(getDiseases()) });
