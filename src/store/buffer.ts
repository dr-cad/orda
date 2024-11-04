import sha256 from "crypto-js/sha256";
import { produce } from "immer";
import _ from "lodash";
import uuid4 from "uuid4";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VERSION } from "../config/app";
import { initInputs } from "../data/ai";
import { exportHistory } from "../lib/history";
import { emptyDiseases, emptySymptoms } from "../lib/raw";
import getScores from "../lib/scores";
import { getSymptomsErrors, getSymptomValueById, updateSymptom } from "../lib/symptoms";
import { IHistoryItem, IHistoryItemBase, ISymptom, Value } from "../types";
import { useAppStore } from "./app";
import { createStorage } from "./create";
import { usePersistStore } from "./history";

export interface BufferStore {
  // ai buffer
  aiInputs: string[];
  setAiInputs: (inputs: string[]) => void;
  resetAiInputs: () => void;
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
      // ai buffer
      aiInputs: initInputs,
      setAiInputs: (inputs) => set({ aiInputs: inputs }),
      resetAiInputs: () => set({ aiInputs: initInputs }),
      // buffer
      uuid: uuid4(),
      symptoms: emptySymptoms,
      createdAt: null,
      updateSymptom: (id, value) => {
        let result = undefined;
        set(
          produce((s: BufferStore) => {
            const arr: ISymptom[] = s.symptoms; // reference
            updateSymptom(arr, id, value);
            result = arr;
          })
        );
        return result;
      },
      save: async (scored) => {
        const symptoms = get().symptoms;
        const uuid = get().uuid;
        const createdAt = get().createdAt;

        // check if symptoms are not empty, if empty ignore saving
        if (_.isEqual(symptoms, emptySymptoms)) {
          if (scored) {
            useAppStore.getState().showSnackbar("Nothing to save", "warning");
            return false;
          }
          return true; // ignore - ok
        }

        const promise = new Promise((resolve) =>
          setTimeout(async () => {
            // create and save data
            const newDate = new Date().getTime();
            const newScores = !scored ? null : getScores({ diseases: emptyDiseases, symptoms }); // heavy calculations
            const newItem: IHistoryItem = {
              uuid,
              symptoms,
              scores: newScores,
              hash: sha256(JSON.stringify(symptoms)).toString(),
              hash2: sha256(JSON.stringify(newScores)).toString(),
              createdAt: createdAt || newDate,
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

            resolve(true);
          })
        );

        if (!scored) await promise; // if draft mode - await for save

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
        // save current buffer first
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
