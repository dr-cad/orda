import * as htmlToImage from "html-to-image";
import theme from "../config/theme";
import * as Sentry from "@sentry/react";

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
    if (!navigator.canShare) throw new Error("Sharing unavailable on your browser!");
    const data = await takeScreenshoot(el, backgroundColor);
    const resp = await fetch(data);
    const blob = await resp.blob();
    const file = new File([blob], filename, { type: "image/png" });
    const title = "ORDA";
    if (!navigator.canShare({ files: [file] })) throw new Error("Can't share image");
    await navigator.share({ files: [file], title, text: subtitle });
  } catch (err) {
    doAlert(err);
    Sentry.captureException(err);
  }
};

export const handleDownloadImage = async (el: HTMLElement, filename: string) => {
  try {
    const data = await takeScreenshoot(el, "white");
    downloadFile(filename, data);
  } catch (err) {
    doAlert(err);
    Sentry.captureException(err);
  }
};

export function downloadFile(filename: string, data: string) {
  try {
    const link = document.createElement("a");
    link.href = data;
    link.download = filename;
    document.body.appendChild(link); // required for firefox
    link.click();
    link.remove();
  } catch (err) {
    doAlert(err);
    Sentry.captureException(err);
  }
}

function doAlert(err: any) {
  if (typeof err === "string") alert(err);
  else if (err?.message) alert(err.message);
  else alert(JSON.stringify(err, ["message", "arguments", "type", "name"]));
}
