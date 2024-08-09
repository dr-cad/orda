// types

import { AlertColor } from "@mui/material";

export enum AppMode {
  Preval = "prevalance",
  Raw = "raw",
}

export type ChartMode = "treemap" | "bar";

export enum Feature {
  DentPicker = "dent-picker",
  ImagePicker = "image-picker",
}

export type Value = string | number | IRange | Date | boolean;

export type Desc = {
  title?: string;
  image?: string;
  feature?: Feature;
  params?: any[]; // passed to feature component
};

export type SymptomType = "string" | "number" | "range" | "date" | "enum" | "none";

export interface ISymptomRaw {
  id: string;
  name: string;
  desc?: Desc;
  caption?: string;
  page?: number;
  required?: boolean;
  type?: SymptomType;
  options?: string[];
  open?: boolean;
  value?: Value; // default or changed
  min?: number;
  max?: number;
  omitHash?: boolean;
  noInput?: boolean;
}

export interface ISymptom extends ISymptomRaw {
  type: SymptomType;
}

export interface IDisease {
  id: string;
  name: string;
  preval: number;
  factors: IDiseaseFactor[];
}

export interface IDiseaseFactor {
  sid: string;
  rate?: number;
  ranges?: IFactorRange[];
}

export interface IRange {
  a: number;
  b: number;
}

export interface IFactorRange extends IRange {
  rate: number;
}

export interface IScoredDisease extends IDisease {
  value: number;
  pvalue: number;
}

export interface IHistoryItem {
  uuid: string;
  createdAt: Date;
  symptoms: ISymptom[];
  scores: IScoredDisease[];
  unsaved?: boolean;
  hash: string;
  hash2: string;
}

export interface IError {
  symptom?: ISymptom;
  message: string;
  severity: AlertColor;
  link?: string;
}

export interface IReport {
  sid?: string;
  ranges?: (IRange & { text: string })[];
  text?: string | string[];
}
