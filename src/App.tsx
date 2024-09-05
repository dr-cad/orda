import { clarity } from "react-microsoft-clarity";
import { Navigate, Route, Routes } from "react-router-dom";
import PageLayout from "./components/PageLayout";
import HistoryPage from "./pages/HistoryPage";
import IntroPage from "./pages/IntroPage";
import ReportPage from "./pages/ReportPage";
import ResultPage from "./pages/ResultPage";
import SymptomsPage from "./pages/SymptomsPage";
import { useAppStore } from "./store/app";

export default function App() {
  if (import.meta.env.PROD) clarity.init("nj04qzc3hn");
  const history = useAppStore((s) => s.history);

  return (
    <Routes>
      <Route
        path="/intro"
        element={history.length ? <Navigate to="/history" replace /> : <PageLayout children={<IntroPage />} />}
      />
      <Route path="/list/:pageIndex" element={<PageLayout children={<SymptomsPage />} />} />
      <Route
        path="/history"
        element={!history.length ? <Navigate to="/intro" replace /> : <PageLayout children={<HistoryPage />} />}
      />
      <Route path="/result/:id" element={<PageLayout children={<ResultPage />} />} />
      <Route path="/report/:id" element={<PageLayout children={<ReportPage />} />} />
      <Route path="*" element={<Navigate to="/intro" replace />} />
    </Routes>
  );
}
