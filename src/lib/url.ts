export function objectToUrlParams(obj: { [k: string]: any }) {
  const params = new URLSearchParams();
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      // range
      params.append(key, obj[key].a);
      params.append(key, obj[key].b);
    } else if (typeof obj[key] !== "undefined") {
      // number, bool
      params.append(key, obj[key]);
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
