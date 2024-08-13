import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../config/store";
import { exportHistory } from "../lib/history";
import getScores from "../lib/scores";
import { getId } from "../lib/utils";

export function usePageIndex() {
  const symptoms = useStore((s) => s.symptoms);
  const nav = useNavigate();
  const { pageIndex: pi } = useParams();
  const { pathname } = useLocation();

  const show = useMemo(() => pathname.startsWith("/list") || pathname.startsWith("/result"), [pathname]);

  const pageIndex = useMemo(() => (pi ? parseInt(pi) - 1 : 0), [pi]);
  const pages = useMemo(() => symptoms.filter((i) => i.page), [symptoms]);
  const currPage = pages[pageIndex];

  const isResult = pathname.startsWith("/result");
  const canGoBack = pageIndex > 0 || isResult;
  const canGoForward = !isResult && pageIndex < pages?.length - 1;

  const handleTo = (i: number) => {
    if (0 < i && i < pages.length + 1) nav("/list/" + i);
  };
  const handlePrev = () => {
    if (canGoBack) nav("/list/" + (!isResult ? pageIndex : pages?.length));
  };
  const handleNext = () => {
    if (canGoForward) nav("/list/" + (pageIndex + 2));
  };

  const diseases = useStore((s) => s.diseases);
  const addHistory = useStore((s) => s.addHistory);
  const autoBackup = useStore((s) => s.autoBackup);

  const handleResult = () => {
    // if no id provided - save new
    const newScores = getScores({ diseases, symptoms }); // heavy calculations
    // update in-app history
    const history = addHistory({ createdAt: new Date(), scores: newScores, symptoms });
    if (history instanceof Error) return; // TODO show snackbar
    // download a backup file
    if (autoBackup) exportHistory(history);
    // navigate to result
    const item = history[0];
    nav("/result/" + getId(item.uuid));
  };

  return {
    show,
    pages,
    isResult,
    pageIndex,
    currPage,
    canGoBack,
    canGoForward,
    handleTo,
    handlePrev,
    handleNext,
    handleResult,
  };
}
