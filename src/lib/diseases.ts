import rawDiseases from "../data/diseases";
import rawSymptoms from "../data/symptoms";
import { IDisease } from "../types/interfaces";

export default function getRawDiseases() {
  const data: IDisease[] = rawDiseases;

  const validate = () => {
    let idRepo: string[] = [];
    for (let item of data) {
      if (!item.id) {
        return { item, message: "No Id defined" };
      }
      if (/[A-Z]/.test(item.id)) {
        return { item, message: "Id includes Uppercase!" };
      }
      if (item.id.includes(" ")) {
        return {
          item,
          message: "Id includes Space letter, consider using '-' instead",
        };
      }

      if (idRepo.includes(item.id)) {
        return { item, message: "Duplicate id found: " + item.id };
      } else {
        idRepo.push(item.id);
      }

      if (!!item.factors) {
        for (let factor of item.factors) {
          if (!rawSymptoms.find((x) => x.id === factor.sid)) {
            return {
              item,
              message: "Couldnt find factor with Id: " + factor.sid,
            };
          }
        }
      }
    }
    return null;
  };

  const error = validate();

  if (!!error) {
    console.log("Diseases data not valid", error);
    return [];
  }

  return data;
}
