import { useLocation, useNavigate } from "react-router-dom";
import { useBufferStore, usePersistStore } from "../config/store";
import { exportHistory, importHistory } from "../lib/history";
import { IHistoryItem } from "../types";

export default function useAppHistory() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const history = usePersistStore((s) => s.history);
  const reset = useBufferStore((s) => s.reset);
  const showSnackbar = useBufferStore((s) => s.showSnackbar);

  const handleExportHistory: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    exportHistory(history);
    showSnackbar("History file exported successfully!");
  };

  const handleImportHistory: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    importHistory((progress) => {
      if (progress === 0) showSnackbar("Importing history file...");
      else if (progress === 1) showSnackbar("History file imported successfully!", "success");
      else showSnackbar("Importing history file...", "info", progress * 100);
    });
    if (!pathname.startsWith("/history")) nav("/history");
  };

  const handleNewRecord = () => {
    reset();
    nav("/list/1");
  };

  return { handleImportHistory, handleExportHistory, handleNewRecord };
}

export function useHistoryItem(id?: string): IHistoryItem | undefined {
  const history = usePersistStore((s) => s.history);
  const showSnackbar = useBufferStore((s) => s.showSnackbar);

  if (!id) {
    showSnackbar("History item id not provided!", "error");
    return;
  }
  const item = history.find((r) => r.uuid.startsWith(id));
  if (!item) {
    showSnackbar("Can't find history record item!", "error");
    return;
  }
  return item;
}
