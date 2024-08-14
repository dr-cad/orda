import { Link } from "@mui/material";
import { useMemo } from "react";
import { useStore } from "../config/store";
import { useSymptomValue } from "../hooks/symptom";
import { getSymptomValueById } from "../lib/symptoms";

export default function DupNameChecker() {
  const history = useStore((s) => s.history);
  const loadHistory = useStore((s) => s.loadHistory);

  const patName = useSymptomValue<string>("pat-name");
  const index = useMemo(
    () => history.findIndex((x) => getSymptomValueById<string>(x.symptoms, "pat-name") === patName),
    [history, patName]
  );

  const load = () => {
    if (index < 0) return;
    loadHistory(history[index]);
  };

  if (!patName || index < 0 || patName.length < 3) {
    return <span>Please enter the full name</span>;
  }

  return (
    <span style={{ margin: 0 }}>
      There's{" "}
      <Link sx={{ cursor: "pointer" }} onClick={load}>
        a patient with the same name
      </Link>
    </span>
  );
}
