import { PersistStore } from "../config/store";
import { appName } from "../config/strings";
import { IHistoryItem } from "../types";
import { downloadFile } from "./share";

export async function exportHistory(history: IHistoryItem[]) {
  const prefix = appName;
  const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
  downloadFile(`${prefix} ${new Date().toLocaleString()}.json`, data);
}

type ProgressCallback = (progress: number) => void;

export async function importHistory(addHistory: PersistStore["addHistory"], callback: ProgressCallback) {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = false;
  input.accept = "application/json";
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
        const data = JSON.parse(content!.toString());
        if (!Array.isArray(data)) throw new Error("wrong content");
        data.reverse().forEach((item, i) =>
          setTimeout(() => {
            const history = addHistory(item);
            const progress = (i + 1) / data.length;
            console.log(progress, history?.length);
            callback(progress);
            // if (!history) throw new Error("Couldn't import item");
          })
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
