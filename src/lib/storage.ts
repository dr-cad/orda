const DEFAULT_PRESERVE_SPACE = 150 * 1024; // 150 KB
const MAX_SPACE = 5 * 1024 * 1024; // FIXME REMOVE: workaround for - chrome gives more space to different localstorage vars

export function calcStorageSpace(preserve = DEFAULT_PRESERVE_SPACE) {
  const used = JSON.stringify(localStorage).length;
  let free = 0;
  for (let i = 0, data = "m"; i < 40; i++) {
    try {
      localStorage.setItem("DATA", data);
      data += data; // 2 ^ i
    } catch (e) {
      free = JSON.stringify(localStorage).length;
      free -= preserve;
      free = Math.min(free, MAX_SPACE - used);

      if (import.meta.env.DEV) {
        console.log(`Storage space: ${(used / 1024).toFixed(2)}K/${((free + used) / 1024).toFixed(2)}K (${i})`);
      }
      break;
    }
  }
  localStorage.removeItem("DATA");
  return { used, free };
}
