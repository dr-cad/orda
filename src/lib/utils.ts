export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getId = (uuid: string) => uuid.split("-")[0];
