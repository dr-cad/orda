import sha256 from "crypto-js/sha256";
import { produce } from "immer";
import _ from "lodash";
import uuid4 from "uuid4";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VERSION } from "../config/strings";
import { exportHistory } from "../lib/history";
import { emptyDiseases, emptySymptoms } from "../lib/raw";
import getScores from "../lib/scores";
import {
  digestSymptom,
  getSymptomsErrors,
  getSymptomValueById,
  recursivelyResetItem,
  recursivelyUpdateParents,
} from "../lib/symptoms";
import { IHistoryItem, IHistoryItemBase, ISymptom, Value } from "../types";
import { useAppStore } from "./app";
import { createStorage } from "./create";
import { usePersistStore } from "./history";

export interface BufferStore {
  // buffer
  uuid: string;
  symptoms: ISymptom[];
  createdAt: number | null;
  updateSymptom: (id: string, value: Value) => ISymptom[] | undefined;
  save: (scored?: boolean) => Promise<string | boolean>; // buffer -> hisory
  reset: () => Promise<void>; // save, ~buffer
  loadHistoryItem: (item: IHistoryItemBase, overwrite?: boolean) => Promise<void>; // history -> buffer
  // app ui
  collapsed: boolean;
  toggleExpanded: (id: string, open?: boolean) => void;
  collapseAll: () => void;
  expandAll: () => void;
}

export const useBufferStore = create(
  persist<BufferStore>(
    (set, get) => ({
      // buffer
      uuid: uuid4(),
      symptoms: emptySymptoms,
      createdAt: null,
      updateSymptom: (id, value) => {
        let result = undefined;
        set(
          produce((s: BufferStore) => {
            const arr: ISymptom[] = s.symptoms; // reference
            const item = arr.find((i) => i.id === id);
            if (item) {
              // NOTICE Quick fix: I excluded inputs from reseting - the reason why I did this is that, the input items don't have children.
              const { hasInput } = digestSymptom(item);
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
      save: async (scored) => {
        // adds buffer to history with new scores - if needed
        // check if symptoms are not empty, if empty ignore saving
        const symptoms = get().symptoms;
        if (_.isEqual(symptoms, emptySymptoms)) {
          if (scored) {
            useAppStore.getState().showSnackbar("Nothing to save", "warning");
            return false;
          }
          return true; // ignore - ok
        }

        const uuid = get().uuid;

        setTimeout(async () => {
          // save data
          const newDate = new Date().getTime();
          const newScores = !scored ? null : getScores({ diseases: emptyDiseases, symptoms }); // heavy calculations
          const newItem: IHistoryItem = {
            symptoms,
            scores: newScores,
            uuid: get().uuid,
            hash: sha256(JSON.stringify(symptoms)).toString(),
            hash2: sha256(JSON.stringify(newScores)).toString(),
            createdAt: get().createdAt || newDate,
            updatedAt: newDate,
            v: VERSION,
            // base
            patName: getSymptomValueById<string>(symptoms, "pat-name") ?? "",
            draft: !scored,
            errors: getSymptomsErrors(symptoms),
          };

          // report to clarity
          try {
            window.clarity?.("event", "saveResult");
            window.clarity?.("set", "result", newItem.hash2);
          } catch (e) {
            console.log(e);
          }

          const app = useAppStore.getState();
          const persist = usePersistStore.getState();

          // update archive
          await persist.addHistory([newItem]); // dont await

          // download a backup file
          if (app.autoBackup) exportHistory(persist.history);
        });

        return uuid;
      },
      reset: async () => {
        // saves and resets buffer
        // save first
        if (!(await get().save())) return;
        console.log("RESET");
        // update buffer
        set({
          uuid: uuid4(),
          symptoms: emptySymptoms,
          createdAt: null,
        });
      },

      // history
      loadHistoryItem: async (_item, overwrite) => {
        // saves and updates buffer
        // get item from archive
        const item = usePersistStore.getState().history.find((x) => x.uuid === _item.uuid);
        if (!item) {
          console.error("No record found from db");
          return;
        }
        // check not same uuid loading
        if (item.uuid === get().uuid) {
          console.warn("Record already loaded!");
          return;
        }
        // save first
        if (!overwrite && !(await get().save())) return;
        // load item
        console.log("BEFORE", (JSON.stringify(get().symptoms).length / 1024).toFixed(2));
        console.log("AFTER", (JSON.stringify(item.symptoms).length / 1024).toFixed(2));
        // update buffer
        set({
          uuid: item.uuid,
          symptoms: item.symptoms,
          createdAt: item.createdAt,
        });
        useAppStore.getState().showSnackbar("History record loaded!");
      },

      // app ui
      collapsed: false,
      toggleExpanded: (id, open) => {
        // for single item
        set(
          produce((s: BufferStore) => {
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
          produce((s: BufferStore) => {
            s.collapsed = true;
            s.symptoms.forEach((item) => {
              if (!item.value) item.open = false;
            });
          })
        );
      },
      expandAll: () => {
        set(
          produce((s: BufferStore) => {
            s.collapsed = false;
            s.symptoms.forEach((item) => {
              item.open = true;
            });
          })
        );
      },
    }),
    { name: "buffer", storage: createStorage() }
  )
);
