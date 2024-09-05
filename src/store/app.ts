import { AlertProps } from "@mui/material";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IHistoryItemBase } from "../types";
import { createStorage } from "./create";
import { usePersistStore } from "./history";

export interface AppStore {
  // history
  history: IHistoryItemBase[];
  // app features
  snackbar: { message: string; severity?: AlertProps["severity"]; progress?: number } | null;
  showSnackbar: (message: string, severity?: AlertProps["severity"], progress?: number) => void;
  hideSnackbar: () => void;
}

export const useAppStore = create(
  persist<AppStore>(
    (set) => ({
      // history
      history: [],
      // app ui
      snackbar: null,
      showSnackbar: (message, severity, progress) => {
        set({ snackbar: { message, severity, progress } });
      },
      hideSnackbar: () => {
        set({ snackbar: null });
      },
    }),
    { name: "app", storage: createStorage() }
  )
);

usePersistStore.subscribe((s) => {
  const history: IHistoryItemBase[] = s.history.map(
    ({ createdAt, hash, hash2, updatedAt, uuid, v, patName, draft, errors }) => ({
      createdAt,
      hash,
      hash2,
      updatedAt,
      uuid,
      v,
      patName,
      draft,
      errors,
    })
  );
  useAppStore.setState({ history });
});
