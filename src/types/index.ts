import { AlertColor, AlertProps } from "@mui/material";
import { SId } from "./sid";

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ui

export interface ISnackbar {
  message: string;
  severity?: AlertProps["severity"];
  progress?: number;
}

export enum AppMode {
  Preval = "prevalance",
  Raw = "raw",
}

export enum Keys {
  title = "title",
  raw = "Pattern match",
  pval = "Prevalance data",
}

export type BarDatum = {
  [k in Keys]: string | number;
};

export enum SortType {
  Created,
  AZ,
}

export enum SortDir {
  Desc = "desc",
  Asc = "asc",
}

export enum Feature {
  DuplicateNameChecker = "dup-name-checker",
  DentPicker = "dent-picker",
  ImagePicker = "image-picker",
}

// types

export type Desc = {
  title?: string;
  image?: string;
  feature?: Feature;
  params?: any[]; // passed to feature component
};

export enum SymptomType {
  String = "string",
  Number = "number",
  Range = "range",
  Enum = "enum",
  None = "none",
}

export type Value = string | number | IRange | boolean;

export interface ISymptomRaw {
  id: SId;
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
  details?: string; // api description for gpt
  title?: string; // open-api title for gpt
  gpt?: boolean; // to include in gpt api
}

export interface ISymptom extends ISymptomRaw {
  type: SymptomType;
  value?: Value; // default or changed or reset
}

export interface IRange {
  a: number;
  b: number;
}

export interface IFactorRange extends IRange {
  rate: number;
}

export interface IDiseaseFactor {
  sid: SId;
  rate?: number;
  ranges?: IFactorRange[];
}

export interface IDisease {
  id: string;
  name: string;
  preval: number;
  factors: IDiseaseFactor[];
}

export interface IDiseaseScored extends IDisease {
  value: number;
  pvalue: number;
}

export interface IHistoryItemBase {
  v: number; // for version mismatch
  uuid: string;
  createdAt: number;
  updatedAt: number;
  hash: string;
  hash2: string;
  patName: string;
  draft: boolean;
  errors?: IError[];
}

export interface IHistoryItem extends IHistoryItemBase {
  symptoms: ISymptom[];
  scores: IDiseaseScored[] | null;
}

export interface IError {
  symptom?: ISymptom;
  message: string;
  severity: AlertColor;
  link?: string;
}

export interface IReport {
  sid?: SId;
  ranges?: (IRange & { text: string })[];
  text?: string | string[];
}

// image

export interface ICImage {
  url: string;
  deleteToken: string;
  // filename: string;
  hash: string;
}

// ai

export interface IAiForm {
  content: string;
  placeholder: string;
}

export interface Fields {
  [k: string]: ISymptom["value"];
}
