import { useNavigate } from "react-router-dom";
import { useStore } from "../config/store";
import { exportHistory, importHistory } from "../lib/history";
import { calcStorageSpace } from "../lib/storage";
import getRawSymptoms from "../lib/symptoms";
import _ from "lodash";

const SAVE_DRAFT_SPACE_LEFT = 250 * 1024; // 250KB

const rawSymptoms = getRawSymptoms();

export default function useAppHistory() {
  const nav = useNavigate();

  const history = useStore((s) => s.history);
  const addHistory = useStore((s) => s.addHistory);
  const symptoms = useStore((s) => s.symptoms);
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
  };

  const saveDraft = () => {
    // calculate available space for saving draft
    if (calcStorageSpace().free < SAVE_DRAFT_SPACE_LEFT) {
      showSnackbar(`Unable to save draft! No space left`, "error.main");
      return;
    }
    // check if symptoms are not empty, if empty ignore saving draft
    if (_.isEqual(symptoms, rawSymptoms)) return;
    // save draft and tell
    addHistory({ createdAt: new Date(), scores: [], symptoms, unsaved: true });
    showSnackbar("Draft saved! You can view it any time in history page");
  };

  const handleNewRecord = (draft = false) => {
    // save prev data as history
    if (draft) saveDraft();
    // clear list
    reset(); // reset uuid, symptoms, diseases
    // nav to home page 1
    nav("/list/1");
    // show notification
  };

  return { handleImportHistory, handleExportHistory, handleNewRecord, saveDraft };
}
