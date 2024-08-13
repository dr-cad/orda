import rawSymptoms from "../data/symptoms";
import { IError, ISymptomRaw } from "../types/interfaces";
import { ISymptom } from "./../types/interfaces";

const MAX_OPTIONS_TO_OPEN = 3;

type ValidationError = {
  item: ISymptomRaw;
  message: string;
};

const symptomTypes = ["string", "number", "range", "date", "enum", "none"];

// TODO according to commit 32dc533, we need new validation, which ensures that input items (string, number, range), don't inlcude children
// TODO page items should not have any type! - also define a new type "page" for that

export default function getRawSymptoms(data: ISymptomRaw[] = rawSymptoms): ISymptom[] {
  const validate = (): ValidationError | null => {
    const idRepo: string[] = [];
    for (const item of data) {
      // validate item.id
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

      // check duplicate
      if (idRepo.includes(item.id)) {
        return { item, message: "Duplicate id found: " + item.id };
      } else {
        idRepo.push(item.id);
      }

      // check children
      if (item.options) {
        for (const childId of item.options) {
          if (!data.find((x) => x.id === childId)) {
            return { item, message: "Couldnt find child with Id: " + childId };
          }
        }
      }

      // validate type string
      if (item.type && !symptomTypes.includes(item.type)) {
        return { item, message: "Symptom type is invalid: " + item.type };
      }

      // TODO validate if range has min max
    }
    return null;
  };

  const error = validate();

  if (error) {
    console.log("Symptom not valid", error);
    return [];
  }

  // remove unnecessary children
  const dataFiltered = [...data];

  // fill empty types with none
  const dataMapped = dataFiltered.map<ISymptom>((item) => {
    const hasEnoughChildren = Array.isArray(item.options) && item.options.length < MAX_OPTIONS_TO_OPEN;
    const hasEnumParent = !!dataFiltered.find((parent) => parent.options?.includes(item.id) && parent.type === "enum");
    const isOpen = typeof item.open === "boolean" ? item.open : hasEnoughChildren || !hasEnumParent; // TODO also if not boolean, close level-3 parents (hint: page>level-1>level-2>level-3)
    return {
      ...item,
      type: item.type ? item.type : "none",
      open: isOpen,
    };
  });

  return dataMapped;
}

export function getSymptomValueById<T>(symptoms: ISymptom[], sid: string): T | undefined {
  return symptoms.find((s) => s.id === sid)?.value as never;
}

export function digestSymptom(symptom?: ISymptom) {
  if (!symptom) return {};
  const inputable = symptom.type !== "enum" && symptom.type !== "none";
  const hasInput = !symptom.noInput && inputable;
  const hasDesc = !!symptom.desc;
  const hasOptions = Array.isArray(symptom.options) && symptom.options.length !== 0;
  const expandable = !!symptom && (hasDesc || hasInput || hasOptions);
  const isEnumParent = symptom.type === "enum" && Array.isArray(symptom.options) && symptom.options?.length > 1;
  return { inputable, hasInput, hasDesc, hasOptions, expandable, isEnumParent };
}

export function getSymptomPage(symptoms: ISymptom[], symptom: ISymptom): number | undefined {
  if (symptom.page) return symptom.page;
  const parent = symptoms.find((s) => s.options?.includes(symptom.id));
  if (parent) return getSymptomPage(symptoms, parent);
  return undefined;
}

export function getSymptomsErrors(symptoms: ISymptom[]): IError[] {
  const errors: IError[] = [];

  // find unfilled required fields
  const list1 = symptoms.filter((s) => s.required && !s.value);
  if (list1.length > 0) {
    const firstErrorPage = getSymptomPage(symptoms, list1[0]);
    const names = list1.map((s) => `${s.name}`).join(", ");
    errors.push({
      severity: "warning",
      message: `The "${names}" ${
        list1.length > 1
          ? "fields are required, please fill them and retry!"
          : "field is required, please fill that and retry!"
      }`,
      link: "/list/" + firstErrorPage,
    });
  }

  return errors;
}

/**
 * clear items value and its children
 * @param arr list of all symptoms
 * @param id id of the symptom
 */
export function recursivelyResetItem(arr: ISymptom[], id: string) {
  // populate item
  let item = arr.find((x) => x.id === id);
  // reset if found
  if (item) {
    console.log("Removing", item.id);
    // reset self
    item.value = undefined;
    item.open = false; // close the item
    // reset each child recursively
    if (Array.isArray(item.options)) {
      item.options.forEach((o) => recursivelyResetItem(arr, o));
    }
  } else console.error("Couldn't find option", id);
}

/**
 * for enum parents that already have values, update the values
 * based on the child change
 * @param arr list of all symptoms
 * @param id id of the symptom
 */
export function recursivelyUpdateParents(arr: ISymptom[], id: string) {
  // find a parent which has this id as a child
  const parent = arr.find((p) => p.options?.includes(id));
  if (parent) {
    console.log("Updating Parent", parent.id);
    parent.value = false;
    for (const option of parent.options ?? []) {
      // reset siblings of enum parent
      if (parent.type === "enum" && option !== id) recursivelyResetItem(arr, option);
      // set ancestors whom have value
      // it works: because it fills from inner parents to outer ones
      const item = arr.find((item) => item.id === option);
      if (!!item?.value) parent.value = true;
    }
    recursivelyUpdateParents(arr, parent.id);
  }
}
