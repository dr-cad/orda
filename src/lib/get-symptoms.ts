import rawSymptoms from "../data/symptoms";
import { ISymptom, ISymptomRaw, SymptomType } from "../types";

const MAX_OPTIONS_TO_OPEN = 3;

// TODO according to commit 32dc533, we need new validation, which ensures that input items (string, number, range), don't inlcude children
// TODO page items should not have any type! - also define a new type "page" for that

export function getSymptoms(): ISymptom[] {
  const data: ISymptomRaw[] = rawSymptoms;

  const validate = () => {
    const idRepo: string[] = [];
    for (const item of data) {
      // validate item.id
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

      // check duplicate
      if (idRepo.includes(item.id)) {
        throw { item, message: "Duplicate id found: " + item.id };
      } else {
        idRepo.push(item.id);
      }

      // check children
      if (item.options) {
        for (const childId of item.options) {
          if (!data.find((x) => x.id === childId)) {
            throw { item, message: "Couldnt find child with Id: " + childId };
          }
        }
      }

      // TODO validate if range has min max
    }
  };

  try {
    validate();
  } catch (error) {
    console.log("Symptom not valid", error);
    return [];
  }

  // remove unnecessary children
  const dataFiltered = [...data];

  // fill empty types with none
  const dataMapped = dataFiltered.map<ISymptom>((item) => {
    const hasEnoughChildren = Array.isArray(item.options) && item.options.length < MAX_OPTIONS_TO_OPEN;
    const hasEnumParent = !!dataFiltered.find(
      (parent) => parent.options?.includes(item.id) && parent.type === SymptomType.Enum
    );
    // TODO also if not boolean, close level-3 parents (hint: page>level-1>level-2>level-3)
    const isOpen = typeof item.open === "boolean" ? item.open : hasEnoughChildren || !hasEnumParent;
    return {
      ...item,
      type: item.type ? item.type : SymptomType.None,
      open: isOpen,
    };
  });

  return dataMapped;
}

export default () => ({ data: getSymptoms() });
