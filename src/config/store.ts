import * as Sentry from "@sentry/react";
import sha256 from "crypto-js/sha256";
import { produce } from "immer";
import _ from "lodash";
import uuid4 from "uuid4";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import getRawDiseases from "../lib/diseases";
import getScores from "../lib/scores";
import { calcStorageSpace } from "../lib/storage";
import getRawSymptoms, { recursivelyResetItem, recursivelyUpdateParents } from "../lib/symptoms";
import { IHistoryItem, ISymptom, Value } from "../types/interfaces";

export interface Store {
  checkSpace: (need?: number) => boolean;
  // buffer
  uuid: string;
  symptoms: ISymptom[];
  createdAt: number | null;
  updateSymptom: (id: string, value: Value) => ISymptom[] | undefined;
  save: (draft?: boolean) => IHistoryItem[] | null; // buffer -> hisory
  reset: () => void; // save, ~buffer
  // history
  history: IHistoryItem[];
  addHistory: (item: IHistoryItem) => IHistoryItem[] | null; // check space, +history
  removeHistory: (uuid: string) => void; // -history
  loadHistory: (item: IHistoryItem, overwrite?: boolean) => void; // history -> buffer
  // app ui
  collapsed: boolean;
  toggleExpanded: (id: string, open?: boolean) => void;
  collapseAll: () => void;
  expandAll: () => void;
  // app features
  initialized: boolean;
  setInitialized: () => void;
  snackbar: { message: string; color?: string } | null;
  showSnackbar: (message: string, color?: string) => void;
  hideSnackbar: () => void;
  // app settings
  autoBackup: boolean;
}

export const useStore = create(
  persist<Store>(
    (set, get) => ({
      checkSpace: (needed = 10 * 1024) => {
        if (calcStorageSpace().free < needed) {
          get().showSnackbar(`Unable to save! No space left`, "error.main");
          return false;
        }
        return true;
      },

      // buffer
      uuid: uuid4(),
      symptoms: getRawSymptoms(),
      createdAt: null,
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
      save: (draft = true) => {
        // adds buffer to history with new scores - if needed
        // check if symptoms are not empty, if empty ignore saving
        const symptoms = get().symptoms;
        if (_.isEqual(symptoms, getRawSymptoms())) return get().history; // ignore - ok
        // save data and tell
        const newScores = draft ? null : getScores({ diseases: getRawDiseases(), symptoms }); // heavy calculations
        const newDate = new Date().getTime();
        const newItem: IHistoryItem = {
          symptoms,
          scores: newScores,
          uuid: get().uuid,
          hash: sha256(JSON.stringify(symptoms)).toString(),
          hash2: sha256(JSON.stringify(newScores)).toString(),
          createdAt: get().createdAt || newDate,
          updatedAt: newDate,
        };

        try {
          window.clarity?.("event", "saveResult");
          window.clarity?.("set", "result", newItem.hash2);
        } catch (e) {
          console.log(e);
        }

        return get().addHistory(newItem);
      },
      reset: () => {
        // saves and resets buffer
        // save first
        if (!get().save()) return;
        console.log("RESET");
        // update buffer
        set({
          uuid: uuid4(),
          symptoms: getRawSymptoms(),
          createdAt: null,
        });
      },

      // history
      history: [],
      addHistory: (item) => {
        const free = get().checkSpace(JSON.stringify(item.symptoms).length);
        if (!free) return null;
        // update
        set(
          produce((s: Store) => {
            const existing = s.history.findIndex((r) => r.uuid === item.uuid);
            if (existing < 0) {
              s.history.unshift(item);
              s.snackbar = { message: `Record saved!`, color: "success.main" };
              return;
            }
            const existingItem = s.history[existing];
            let newItem = { ...item };
            if (_.isEqual(existingItem.symptoms, item.symptoms)) {
              // if symptoms unchanged, use any available scores
              newItem.scores = newItem.scores || existingItem.scores;
            }
            if (item.updatedAt > existingItem.updatedAt) {
              // if same uuid and newer -> replace previous
              s.history.splice(existing, 1); // remove outdated
              s.history.unshift(newItem); // add new item
              s.snackbar = { message: `Record updated!`, color: "primary.main" };
              return;
            }
            // else, the item is outdated and can't be imported
            console.log({ item, existingItem });
            s.snackbar = { message: `Record outdated! Can't import`, color: "error.main" };
            Sentry.captureException({ item, existingItem });
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
        get().showSnackbar("History record removed!");
      },
      loadHistory: (item, overwrite) => {
        // saves and updates buffer
        // check not same uuid loading
        if (item.uuid === get().uuid) {
          console.log("Record already loaded!");
          return;
        }
        // save first
        if (!overwrite && !get().save()) return;
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
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage, {}),
    }
  )
);

// TODO add a middleware for storage which checks left space using below code
// calculate available space for saving draft
// if (calcStorageSpace().free < SAVE_DRAFT_SPACE_LEFT) {
//   get().showSnackbar(`Unable to save! No space left`, "error.main");
//   return null;
// }
