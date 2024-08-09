import sha256 from "crypto-js/sha256";
import { produce } from "immer";
import uuid4 from "uuid4";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import getRawDiseases from "../lib/diseases";
import { calcStorageSpace } from "../lib/storage";
import getRawSymptoms, { recursivelyResetItem, recursivelyUpdateParents } from "../lib/symptoms";
import { AppMode, ChartMode, IDisease, IHistoryItem, ISymptom, Value } from "../types/interfaces";

export interface Store {
  symptoms: ISymptom[];
  updateSymptom: (id: string, value: Value) => ISymptom[] | undefined;
  collapsed: boolean;
  toggleExpanded: (id: string, open?: boolean) => void;
  collapseAll: () => void;
  expandAll: () => void;
  diseases: IDisease[];
  reset: () => void;
  history: IHistoryItem[];
  addHistory: (item: Omit<IHistoryItem, "uuid" | "hash" | "hash2">) => IHistoryItem[] | Error;
  removeHistory: (uuid: string) => void;
  loadHistory: (item: IHistoryItem) => void;
  // app ui
  initialized: boolean;
  setInitialized: () => void;
  snackbar: { message: string; color?: string } | null;
  showSnackbar: (message: string, color?: string) => void;
  hideSnackbar: () => void;
  // app settings
  autoBackup: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;
}

export const useStore = create(
  persist<Store>(
    (set, get) => ({
      symptoms: getRawSymptoms(),
      updateSymptom: (id, value) => {
        let result = undefined;
        set(
          produce((s: Store) => {
            let arr: ISymptom[] = s.symptoms;
            let item = arr.find((i) => i.id === id);
            if (item) {
              // NOTICE Quick fix: I excluded inputs from reseting - the reason why I did this is that, the input items don't have children.
              const hasInput = item.type === "string" || item.type === "number" || item.type === "range";
              // if unset occured and has options -> reset item -r
              if (!value && !hasInput) recursivelyResetItem(arr, item.id);
              // update/reset value
              console.log("Updating", id, value);
              item.value = value;
              recursivelyUpdateParents(arr, item.id);
              result = arr;
            } else {
              console.error("Couldnt find item", id);
            }
            result = arr;
          })
        );
        return result;
      },
      reset: () => {
        console.log("RESET");
        set({
          symptoms: getRawSymptoms(),
          diseases: getRawDiseases(),
        });
      },
      collapsed: false,
      toggleExpanded: (id, open) => {
        // for single item
        set(
          produce((s: Store) => {
            const item = s.symptoms.find((item) => item.id === id);
            if (!item) return; // TODO handle
            if (typeof open !== "undefined") {
              item.open = open;
            } else {
              item.open = !item.open;
            }
          })
        );
      },
      collapseAll: () => {
        set(
          produce((s: Store) => {
            s.collapsed = true;
            s.symptoms.forEach((item) => {
              if (!item.value) item.open = false;
            });
          })
        );
      },
      expandAll: () => {
        set(
          produce((s: Store) => {
            s.collapsed = false;
            s.symptoms.forEach((item) => {
              item.open = true;
            });
          })
        );
      },
      diseases: getRawDiseases(),
      history: [],
      addHistory: (item) => {
        if (calcStorageSpace().free < JSON.stringify(item.symptoms).length) {
          set({ snackbar: { message: `Unable to save result! No space left`, color: "error.main" } });
          return Error("No space left");
        }
        // assign a new uuid
        const newItem: IHistoryItem = {
          ...item,
          uuid: uuid4(),
          hash: sha256(JSON.stringify(item.symptoms)).toString(),
          hash2: sha256(JSON.stringify(item.scores)).toString(),
        };
        // update
        set(
          produce((s: Store) => {
            const existing = s.history.findIndex((r) => r.hash === newItem.hash);
            if (existing > -1 && item.unsaved) return; // ignore saving
            if (existing > -1 && (s.history[existing].hash2 === newItem.hash2 || s.history[existing].unsaved)) {
              // if same symptoms and (same scores or unsaved) -> replace previous
              s.history.splice(existing, 1); // would be replaced by new scores - since they're identically equal we don't need previous anymore and it would also bring new data to top
              s.snackbar = { message: `Updated existing record!`, color: "primary.main" };
            } else {
              s.snackbar = { message: `Record saved! You can check it in history`, color: "success.main" };
            }
            s.history.unshift(newItem);
          })
        );
        return get().history;
      },
      removeHistory: (uuid) => {
        set(
          produce((s: Store) => {
            const index = s.history.findIndex((x) => x.uuid === uuid);
            if (index > -1) s.history.splice(index, 1);
          })
        );
      },
      loadHistory: (item) => {
        console.log("BEFORE", (JSON.stringify(get().symptoms).length / 1024).toFixed(2));
        console.log("AFTER", (JSON.stringify(item.symptoms).length / 1024).toFixed(2));
        set({ symptoms: item.symptoms }); // load symptoms into symptoms-buffer
      },
      // app ui
      initialized: false,
      setInitialized: () => {
        set({ initialized: true });
      },
      snackbar: null,
      showSnackbar: (message: string, color?: string) => {
        set({ snackbar: { message, color } });
      },
      hideSnackbar: () => {
        set({ snackbar: null });
      },
      // app settings
      autoBackup: false,
      mode: AppMode.Preval,
      setMode: (mode) => {
        set({ mode });
      },
      chartMode: "bar",
      setChartMode: (chartMode) => {
        set({ chartMode: chartMode });
      },
    }),
    { name: "app-storage", storage: createJSONStorage(() => localStorage) }
  )
);
