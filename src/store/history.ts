import * as Sentry from "@sentry/react";
import { produce } from "immer";
import _ from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VERSION } from "../config/app";
import { getSymptomsErrors, getSymptomValueById } from "../lib/symptoms";
import { IHistoryItem } from "../types";
import { useAppStore } from "./app";
import { createStorage } from "./create";

// TODO create custom persist middleware that doesn't use stringify

export interface PersistStore {
  // history
  history: IHistoryItem[];
  addHistory: (items: IHistoryItem[], callback?: (index: number) => void) => Promise<IHistoryItem[] | null>; // create/update
  removeHistory: (uuid: string) => void; // delete
}

export const usePersistStore = create(
  persist<PersistStore>(
    (set, get) => ({
      // history
      history: [],
      addHistory: async (items, callback?) => {
        const app = useAppStore.getState();
        // update
        set(
          produce((s: PersistStore) => {
            items.forEach((item, i) => {
              callback?.(i);
              migration(item, i);
              const existing = s.history.findIndex((r) => r.uuid === item.uuid);
              if (existing < 0) {
                // save if there's no existing uuid
                s.history.unshift(item);
                if (!callback) app.showSnackbar("Record saved!", "success");
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
                if (!callback) app.showSnackbar("Record updated!", "info");
                return;
              }
              // else, the item is outdated and can't be imported
              console.log({ item, existingItem });
              app.showSnackbar("Record outdated! Can't import", "error");
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
        useAppStore.getState().showSnackbar("History record removed!");
      },
    }),
    {
      name: "archive",
      storage: createStorage(true),
      version: VERSION,
      migrate: (_s) => {
        const s = _s as PersistStore;
        s.history = s.history.map(migration);
        return s;
      },
    }
  )
);

function migration(item: IHistoryItem, index: number): IHistoryItem {
  if (!item.v) {
    // 0 -> 1
    item.patName = getSymptomValueById<string>(item.symptoms, "pat-name") ?? "";
    item.draft = !item.scores;
    item.errors = getSymptomsErrors(item.symptoms);
    item.v = 1;
  }
  if (item.v === 1) {
    // 1 -> 2
    // TOBE filled on v2...
  }
  if (item.v !== VERSION) {
    // no migration plan provided
    alert("App version mismatch! contact dev team asap...");
    const err = new Error(`no migration plans! (${item.v} != ${VERSION}) at index: ${index}`);
    console.error(err);
    Sentry.captureException(err);
    throw err;
  }
  return item;
}
