import { IError, ISymptom, SymptomType } from "../types";

export function getSymptomValueById<T>(symptoms: ISymptom[], sid: string): T | undefined {
  return symptoms.find((s) => s.id === sid)?.value as never;
}

export function digestSymptom(symptom?: ISymptom) {
  if (!symptom) return {};
  const inputable = symptom.type !== SymptomType.Enum && symptom.type !== SymptomType.None;
  const hasInput = !symptom.noInput && inputable;
  const hasDesc = !!symptom.desc;
  const hasOptions = Array.isArray(symptom.options) && symptom.options.length !== 0;
  const expandable = !!symptom && (hasDesc || hasInput || hasOptions);
  const isEnumParent =
    symptom.type === SymptomType.Enum && Array.isArray(symptom.options) && symptom.options?.length > 1;
  return { inputable, hasInput, hasDesc, hasOptions, expandable, isEnumParent };
}

export function getSymptomPage(symptoms: ISymptom[], symptom: ISymptom): number | undefined {
  if (symptom.page) return symptom.page;
  const parent = symptoms.find((s) => s.options?.includes(symptom.id));
  if (parent) return getSymptomPage(symptoms, parent);
  return undefined;
}

/**
 * find any issue validating valued symptoms
 * @param symptoms list of all symptoms
 * @returns error
 */
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
export function recursivelyResetItem(arr: ISymptom[], id: string, silent?: boolean) {
  // populate item
  const item = arr.find((x) => x.id === id);
  // reset if found
  if (item) {
    if (!silent) console.log("Removing", item.id);
    // reset self
    item.value = undefined;
    item.open = false; // close the item
    // reset each child recursively
    if (Array.isArray(item.options)) {
      item.options.forEach((o) => recursivelyResetItem(arr, o, silent));
    }
  } else console.error("Couldn't find option", id);
}

/**
 * for enum parents that already have values, update the values
 * based on the child change
 * @param arr list of all symptoms
 * @param id id of the symptom
 */
export function recursivelyUpdateParents(arr: ISymptom[], id: string, silent?: boolean) {
  // find a parent which has this id as a child
  const parent = arr.find((p) => p.options?.includes(id));
  if (parent) {
    if (!silent) console.log("Updating Parent", parent.id);
    parent.value = false;
    for (const option of parent.options ?? []) {
      // reset siblings of enum parent
      if (parent.type === SymptomType.Enum && option !== id) recursivelyResetItem(arr, option, silent);
      // set ancestors whom have value
      // it works: because it fills from inner parents to outer ones
      const item = arr.find((item) => item.id === option);
      if (item?.value) parent.value = true;
    }
    recursivelyUpdateParents(arr, parent.id, silent);
  }
}

export function updateSymptom(arr: ISymptom[], id: string, value: ISymptom["value"], silent?: boolean) {
  const item = arr.find((i) => i.id === id);
  if (item) {
    // NOTICE Quick fix: I excluded inputs from reseting - the reason why I did this is that, the input items don't have children.
    const { hasInput } = digestSymptom(item);
    // if unset occured and has options -> reset item -r
    if (!value && !hasInput) recursivelyResetItem(arr, item.id, silent);
    // update/reset value
    if (!silent) console.log("Updating", id, value);
    item.value = value;
    recursivelyUpdateParents(arr, item.id, silent);
  } else {
    console.error("Couldnt find item", id);
  }
}
