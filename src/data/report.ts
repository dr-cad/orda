import { IReport } from "../types/interfaces";

const report: IReport[] = [
  {
    text: [
      // static
      "Panaromic radiography revealed",
      "Panaromic examination indicates",
      "Panaromic findings illustrates",
    ],
  },

  { sid: "unilateral", text: "unilateral," },
  { sid: "bilateral", text: "bilateral," },

  { sid: "solitary", text: "solitary," },
  { sid: "multiple", text: "multiple," },
  { sid: "diffuse", text: "generalized diffuse," },

  { sid: "unilocular", text: "unilocular radiolucent" },
  { sid: "multilocular", text: "multilocular radiolucent" },
  // { sid: "linear", text: "multilocular radiolucent with straight septa" },
  // { sid: "curved", text: "multilocular radiolucent" },
  { sid: "radiopaque", text: "radiopaque" },
  { sid: "mixed", text: "mixed radiolucent and radiopaque" },
  { sid: "rarefaction", text: "generalized rarefaction" },
  { text: "lesion with" },

  { sid: "round", text: "round," },
  { sid: "scalloped", text: "scalloped," },
  { sid: "irregular", text: "irregular," },

  { sid: "well-defined", text: "well-defined" },
  { sid: "non-corticated", text: ", and non-corticated border" },
  { sid: "corticated", text: ", and corticated border" },
  { sid: "sclerotic", text: ", and sclerotic border" },
  { sid: "soft-capsule", text: "border with soft-capsule" },

  { sid: "ill-defined", text: "ill-defined" },
  { sid: "blending", text: ", and blending border" },
  { sid: "invasive", text: ", and invasive border" },

  { sid: "unilateral-right", text: "in Rt side" },
  { sid: "unilateral-left", text: "in Lt side" },

  { sid: "maxilla", text: "of maxilla" },
  { sid: "mandible", text: "of mandible" },
  { sid: "both", text: "of maxilla and mandible" },

  { text: "at" },
  {
    sid: "maxilla",
    ranges: [
      { a: 3, b: 4, text: "tuberosity" },
      { a: 4, b: 7, text: "molar" },
      { a: 7, b: 9, text: "premolar" },
      { a: 9, b: 10, text: "canine" },
      { a: 10, b: 12, text: "incisors" },
    ],
  },
  {
    sid: "mandible",
    ranges: [
      { a: 1, b: 2, text: "condyle" },
      { a: 2, b: 3, text: "ramus" },
      { a: 3, b: 4, text: "beginning of ramus" },
      { a: 4, b: 7, text: "molar" },
      { a: 7, b: 9, text: "premolar" },
      { a: 9, b: 10, text: "canine" },
      { a: 10, b: 12, text: "incisors" },
    ],
  },
  {
    sid: "both",
    ranges: [
      { a: 1, b: 2, text: "condyle" },
      { a: 2, b: 3, text: "ramus" },
      { a: 3, b: 4, text: "beginning of ramus" },
      { a: 4, b: 7, text: "molar" },
      { a: 7, b: 9, text: "premolar" },
      { a: 9, b: 10, text: "canine" },
      { a: 10, b: 12, text: "incisors" },
    ],
  },
  { sid: "sinus", text: "and sinus" },
  { text: "region" },

  { sid: "destruct-3", text: " with expansion and destruction of cortical bone" },
  { sid: "extend", text: " with extension within bone without expand" },
  { sid: "expand", text: " with expansion of cortical bone" },
];

export default report;
