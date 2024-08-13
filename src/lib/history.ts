import { Store } from "../config/store";
import { appName } from "../config/strings";
import { IHistoryItem } from "../types/interfaces";
import { downloadFile } from "./share";

export async function exportHistory(history: IHistoryItem[]) {
  const prefix = appName;
  const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
  downloadFile(`${prefix} ${new Date().toLocaleString()}.json`, data);
}

export async function importHistory(addHistory: Store["addHistory"], callback: Function) {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = false;
  input.accept = "application/json";
  input.onchange = (e) => {
    const file = (e.target as any).files[0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = (readerEvent) => {
      try {
        const content = readerEvent.target!.result;
        if (!content) throw new Error("empty file");
        const data = JSON.parse(content!.toString());
        if (!Array.isArray(data)) throw new Error("wrong content");
        data.reverse().forEach((item) => {
          const history = addHistory(item);
          if (history instanceof Error) throw history;
        });
        callback();
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      }
    };
  };
  input.click();
}
