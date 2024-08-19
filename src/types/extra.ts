// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type NoSpaceString<T extends string> = T extends `${infer _}${" "}${infer _}` ? never : T;
