import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useBufferStore, usePersistStore } from "../config/store";
import { exportHistory } from "../lib/history";
import { getId } from "../lib/utils";

export function usePageIndex() {
  const save = useBufferStore((s) => s.save);
  const symptoms = useBufferStore((s) => s.symptoms);
  const autoBackup = usePersistStore((s) => s.autoBackup);

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

  const handleResult = async () => {
    // add to history
    const history = await save(false);
    if (!history) return;
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
