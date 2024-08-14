import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../config/store";
import { exportHistory, importHistory } from "../lib/history";
import { IHistoryItem } from "../types/interfaces";

export default function useAppHistory() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const history = useStore((s) => s.history);
  const addHistory = useStore((s) => s.addHistory);
  const reset = useStore((s) => s.reset);
  const showSnackbar = useStore((s) => s.showSnackbar);

  const handleExportHistory: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    exportHistory(history);
    showSnackbar("History file exported successfully!");
  };

  const handleImportHistory: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    importHistory(addHistory, () => {
      showSnackbar("History file imported successfully!");
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
  const history = useStore((s) => s.history);
  const showSnackbar = useStore((s) => s.showSnackbar);

  if (!id) {
    showSnackbar("History item id not provided!", "error.main");
    return;
  }
  const item = history.find((r) => r.uuid.startsWith(id));
  if (!item) {
    showSnackbar("Can't find history record item!", "error.main");
    return;
  }
  return item;
}
