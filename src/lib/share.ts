import * as htmlToImage from "html-to-image";
import theme from "../config/theme";

export const takeScreenshoot = async (el: HTMLElement, backgroundColor = theme.palette.background.default) => {
  return await htmlToImage.toPng(el, { backgroundColor });
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

export const handleDownloadImage = async (el: HTMLElement, filename: string) => {
  try {
    const data = await takeScreenshoot(el, "white");
    const link = document.createElement("a");

    link.href = data;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.log(err);
  }
};
