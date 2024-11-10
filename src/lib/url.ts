export function objectToUrlParams(obj: { [k: string]: any }) {
  const params = new URLSearchParams();
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
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
