import LZString from "lz-string";
import { PersistStore } from "../config/store";
import { appName } from "../config/strings";
import { IHistoryItem } from "../types";
import { downloadFile } from "./share";

export async function exportHistory(history: IHistoryItem[]) {
  const prefix = appName;
  const data = "data:text/plain;charset=utf-8," + LZString.compressToEncodedURIComponent(JSON.stringify(history));
  downloadFile(`${prefix} ${new Date().toLocaleString()}.doctor`, data);
}

type ProgressCallback = (progress: number) => void;

export async function importHistory(addHistory: PersistStore["addHistory"], callback: ProgressCallback) {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = false;
  input.accept = ".doctor";
  input.onchange = (e) => {
    // callback(0);
    const file = (e.target as any).files[0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = async (ev) => {
      try {
        const content = ev.target!.result;
        if (!content) throw new Error("empty file");
        callback(0);
        const data = JSON.parse(LZString.decompressFromEncodedURIComponent(content!.toString()));
        if (!Array.isArray(data)) throw new Error("wrong content");
        await Promise.all(
          data.reverse().map(
            (item, i) =>
              new Promise((resolve) =>
                setTimeout(() => {
                  const history = addHistory(item);
                  const progress = (i + 1) / data.length;
                  console.log(progress, history?.length);
                  callback(progress);
                  if (!history) console.error("Couldn't import item", i);
                  resolve(progress);
                })
              )
          )
        );
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      }
    };
  };
  input.click();
}
