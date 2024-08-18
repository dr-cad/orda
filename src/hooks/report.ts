import _ from "lodash";
import { useMemo } from "react";
import report from "../data/report";
import { getSymptomValueById } from "../lib/symptoms";
import { IRange, IReport, ISymptom } from "../types/interfaces";

const pickText = (text: string | string[]) => {
  if (typeof text === "string") return text;
  return _.sample(text);
};

const pickFromRange = (ranges: IReport["ranges"], v: IRange) => {
  let from = "";
  let to = "";

  for (const range of ranges!) {
    if (!from && v.a < range.b) from = range.text; // yes it's correct
    if (!to && v.b <= range.b) to = range.text;
  }

  if (from === to) return to + " ";
  return from + " to " + to + " ";
};

export default function useReportFindings(sypmtoms: ISymptom[]) {
  return useMemo(() => {
    let output = "";
    for (const r of report) {
      const spaceBefore = report.indexOf(r) === 0 ? "" : " ";
      if (!r.sid) {
        output += spaceBefore + pickText(r.text!);
        continue;
      }
      const v = getSymptomValueById(sypmtoms, r.sid);
      if (v && r.text) output += spaceBefore + pickText(r.text);
      if (r.ranges && v) output += spaceBefore + pickFromRange(r.ranges, v as IRange);
    }
    return output + ".";
  }, [sypmtoms]);
}
