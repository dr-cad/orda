export {};

declare global {
  interface Window {
    clarity?: (...args: string[]) => Promise<any>;
  }
}
