export const testSecrets = {
  passVisible: "1x00000000000000000000AA",
  blockVisible: "2x00000000000000000000AB",
  passInvisible: "1x00000000000000000000BB",
  blockInvisible: "2x00000000000000000000BB",
  forceChallenge: "3x00000000000000000000FF",
};

export const siteKey = import.meta.env.DEV //
  ? testSecrets.forceChallenge
  : import.meta.env.VITE_TURNSTILE_KEY;
