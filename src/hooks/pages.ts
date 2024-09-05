import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getId } from "../lib/utils";
import { useBufferStore } from "../store";

export function usePageIndex() {
  const save = useBufferStore((s) => s.save);
  const symptoms = useBufferStore((s) => s.symptoms);

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
    const uuid = await save(true);
    if (typeof uuid !== "string") return;
    // navigate to result
    nav("/result/" + getId(uuid));
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
