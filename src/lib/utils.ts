export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getId = (uuid: string) => uuid.split("-")[0];

export const getFilename = (type: "Report" | "Result", fullname: string, uuid: string, postfix: "png" | "json") =>
  `${type} - ${fullname} - ${getId(uuid)}.${postfix}`;

export const calc = (n: number, frac = 16) => Number(n.toFixed(frac));
