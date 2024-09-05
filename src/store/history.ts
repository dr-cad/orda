import * as Sentry from "@sentry/react";
import { produce } from "immer";
import _ from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IHistoryItem } from "../types";
import { useBufferStore } from "./buffer";
import { createStorage } from "./create";

export interface PersistStore {
  // history
  history: IHistoryItem[];
  addHistory: (items: IHistoryItem[], callback?: (index: number) => void) => Promise<IHistoryItem[] | null>; // create/update
  removeHistory: (uuid: string) => void; // delete
  // app settings
  autoBackup: boolean;
}

export const usePersistStore = create(
  persist<PersistStore>(
    (set, get) => ({
      // history
      history: [],
      addHistory: async (items, callback?) => {
        const buffer = useBufferStore.getState();
        // update
        set(
          produce((s: PersistStore) => {
            items.forEach((item, i) => {
              callback?.(i);
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
    { name: "archive", storage: createStorage(true) }
  )
);
