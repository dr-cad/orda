export function encode<T>(input: T) {
  return btoa(JSON.stringify(input));
}

export function decode<T>(input: string) {
  return JSON.parse(btoa(input)) as T;
}
