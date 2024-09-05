import { AlertProps } from "@mui/material";
import * as Sentry from "@sentry/react";
import sha256 from "crypto-js/sha256";
import { produce } from "immer";
import localforage from "localforage";
import _ from "lodash";
import LZString from "lz-string";
import uuid4 from "uuid4";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { emptyDiseases, emptySymptoms } from "../lib/raw";
import getScores from "../lib/scores";
import { calcStorageSpace } from "../lib/storage";
import { digestSymptom, recursivelyResetItem, recursivelyUpdateParents } from "../lib/symptoms";
import { IHistoryItem, ISymptom, Value } from "../types";
import { VERSION } from "./strings";

function createStorage<T>(compress?: boolean) {
  return createJSONStorage<T>(() =>
    compress
      ? {
          getItem: async (key) => {
            const value = await localforage.getItem<string>(key);
            if (value) return LZString.decompress(value);
            return value;
          },
          setItem: (key, value) => {
            // dont return the setItem function or no async ejection would happen
            return localforage.setItem(key, LZString.compress(value));
          },
          removeItem: localforage.removeItem,
        }
      : localStorage
  );
}

export interface BufferStore {
  checkSpace: (need?: number) => boolean;
  // buffer
  uuid: string;
  symptoms: ISymptom[];
  createdAt: number | null;
  updateSymptom: (id: string, value: Value) => ISymptom[] | undefined;
  save: (draft?: boolean) => Promise<IHistoryItem[] | null>; // buffer -> hisory
  reset: () => Promise<void>; // save, ~buffer
  // history
  loadHistory: (item: IHistoryItem, overwrite?: boolean) => Promise<void>; // history -> buffer
  // app ui
  collapsed: boolean;
  toggleExpanded: (id: string, open?: boolean) => void;
  collapseAll: () => void;
  expandAll: () => void;
  // app features
  snackbar: { message: string; severity?: AlertProps["severity"]; progress?: number } | null;
  showSnackbar: (message: string, severity?: AlertProps["severity"], progress?: number) => void;
  hideSnackbar: () => void;
}

export const useBufferStore = create(
  persist<BufferStore>(
    (set, get) => ({
      checkSpace: (needed = 10 * 1024) => {
        if (calcStorageSpace().free < needed) {
          get().showSnackbar(`Unable to save! No space left`, "error");
          return false;
        }
        return true;
      },

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
      save: async (draft = true) => {
        // adds buffer to history with new scores - if needed
        // check if symptoms are not empty, if empty ignore saving
        const symptoms = get().symptoms;
        if (_.isEqual(symptoms, emptySymptoms)) {
          if (!draft) {
            get().showSnackbar("Nothing to save", "warning");
            return null;
          }
          return usePersistStore.getState().history; // ignore - ok
        }
        // save data and tell
        const newDate = new Date().getTime();
        const newScores = draft ? null : getScores({ diseases: emptyDiseases, symptoms }); // heavy calculations
        const newItem: IHistoryItem = {
          symptoms,
          scores: newScores,
          uuid: get().uuid,
          hash: sha256(JSON.stringify(symptoms)).toString(),
          hash2: sha256(JSON.stringify(newScores)).toString(),
          createdAt: get().createdAt || newDate,
          updatedAt: newDate,
          v: VERSION,
        };

        try {
          window.clarity?.("event", "saveResult");
          window.clarity?.("set", "result", newItem.hash2);
        } catch (e) {
          console.log(e);
        }

        return await usePersistStore.getState().addHistory([newItem]);
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
      loadHistory: async (item, overwrite) => {
        // saves and updates buffer
        // check not same uuid loading
        if (item.uuid === get().uuid) {
          console.log("Record already loaded!");
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
        get().showSnackbar("History record loaded!");
      },

      // app ui
      snackbar: null,
      showSnackbar: (message, severity, progress) => {
        set({ snackbar: { message, severity, progress } });
      },
      hideSnackbar: () => {
        set({ snackbar: null });
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
    { name: "buffer-storage", storage: createStorage() }
  )
);

export interface PersistStore {
  // history
  history: IHistoryItem[];
  addHistory: (
    items: IHistoryItem[],
    noCheck?: boolean,
    callback?: (index: number) => void
  ) => Promise<IHistoryItem[] | null>; // check space, +history
  removeHistory: (uuid: string) => void; // -history
  // app settings
  autoBackup: boolean;
}

export const usePersistStore = create(
  persist<PersistStore>(
    (set, get) => ({
      // history
      history: [],
      addHistory: async (items, noCheck?, callback?) => {
        const buffer = useBufferStore.getState();
        if (!noCheck) {
          const free = buffer.checkSpace();
          if (!free) return null;
        }
        // update
        set(
          produce((s: PersistStore) => {
            items.forEach((item, i) => {
              callback?.(i); // FIXME not working - need service worker for entire store
              const existing = s.history.findIndex((r) => r.uuid === item.uuid);
              if (existing < 0) {
                s.history.unshift(item);
                buffer.showSnackbar("Record saved!", "success");
                return;
              }
              const existingItem = s.history[existing];
              const newItem = { ...item };
              if (_.isEqual(existingItem.symptoms, item.symptoms)) {
                // if symptoms unchanged, use any available scores
                newItem.scores = newItem.scores || existingItem.scores;
              }
              if (item.updatedAt > existingItem.updatedAt) {
                // if same uuid and newer -> replace previous
                s.history.splice(existing, 1); // remove outdated
                s.history.unshift(newItem); // add new item
                buffer.showSnackbar("Record updated!", "info");
                return;
              }
              // else, the item is outdated and can't be imported
              console.log({ item, existingItem });
              buffer.showSnackbar("Record outdated! Can't import", "error");
              Sentry.captureException({ item, existingItem });
            });
          })
        );
        return get().history;
      },
      removeHistory: (uuid) => {
        set(
          produce((s: PersistStore) => {
            const index = s.history.findIndex((x) => x.uuid === uuid);
            if (index > -1) s.history.splice(index, 1);
          })
        );
        useBufferStore.getState().showSnackbar("History record removed!");
      },

      // app settings
      autoBackup: false,
    }),
    { name: "app-storage", storage: createStorage(true) }
  )
);

// TODO add a middleware for storage which checks left space using below code
// calculate available space for saving draft
// if (calcStorageSpace().free < SAVE_DRAFT_SPACE_LEFT) {
//   get().showSnackbar(`Unable to save! No space left`, "error");
//   return null;
// }
