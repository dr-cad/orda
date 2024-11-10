import { SId } from "../types/sid";

export function objectToUrlParams(obj: { [k: string]: any }) {
  const params = new URLSearchParams();
  for (const k in obj) {
    const key = sidUnderToHyphen(k);
    const v = obj[k];
    if (typeof v === "object") {
      // range
      params.append(key, v.a);
      params.append(key, v.b);
    } else if (typeof v !== "undefined") {
      // number, bool
      params.append(key, v);
    }
  }
  return params.toString();
}

export function urlParamsToObject(url: string) {
  const params = new URLSearchParams(url);
  const obj: { [k: string]: string } = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
}

export function sidUnderToHyphen(k: string) {
  return k.replace(/__/g, "-").replace(/_/g, "-") as SId;
}
