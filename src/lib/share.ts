import * as htmlToImage from "html-to-image";
import theme from "../config/theme";

export const takeScreenshoot = async (el: HTMLElement, backgroundColor = theme.palette.background.default) => {
  const result = await htmlToImage.toPng(el, {
    backgroundColor,
  });
  return result;
};

export const handleShareImage = async (
  el: HTMLElement,
  filename: string,
  subtitle: string,
  backgroundColor?: string
) => {
  try {
    const data = await takeScreenshoot(el, backgroundColor);
    const resp = await fetch(data);
    const blob = await resp.blob();
    const file = new File([blob], filename, { type: "image/png" });
    const title = "ORDA";
    if (!navigator.canShare?.({ files: [file] })) throw new Error("Can't share image");
    await navigator.share({ files: [file], title, text: subtitle });
  } catch (err) {
    console.log(err);
  }
};
