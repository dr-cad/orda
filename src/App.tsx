import { clarity } from "react-microsoft-clarity";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PageLayout from "./components/PageLayout";
import HistoryPage from "./pages/HistoryPage";
import IntroPage from "./pages/IntroPage";
import ReportPage from "./pages/ReportPage";
import ResultPage from "./pages/ResultPage";
import SymptomsPage from "./pages/SymptomsPage";

// TODO on data available - navigate from intro to history

function App() {
  if (process.env.NODE_ENV === "production") clarity.init("nj04qzc3hn");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/intro" element={<PageLayout children={<IntroPage />} />} />
        <Route path="/list/:pageIndex" element={<PageLayout children={<SymptomsPage />} />} />
        <Route path="/history" element={<PageLayout children={<HistoryPage />} />} />
        <Route path="/result" element={<PageLayout children={<ResultPage />} />} />
        <Route path="/report/:id" element={<PageLayout children={<ReportPage />} />} />
        <Route path="*" element={<Navigate to="/intro" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
