export {};

declare global {
  interface Window {
    clarity?: (...args: string[]) => Promise<any>;
  }
}

// declare interface ImportMeta {
//   compileTime: <T>(file: string) => T;
// }
