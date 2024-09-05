import { Link } from "@mui/material";
import { useMemo } from "react";
import { useSymptomValue } from "../hooks/symptom";
import { getSymptomValueById } from "../lib/symptoms";
import { useBufferStore, usePersistStore } from "../store";

export default function DupNameChecker() {
  const uuid = useBufferStore((s) => s.uuid);
  const history = usePersistStore((s) => s.history);
  const loadHistoryItem = useBufferStore((s) => s.loadHistoryItem);

  const patName = useSymptomValue<string>("pat-name");
  const index = useMemo(
    () => history.findIndex((x) => getSymptomValueById<string>(x.symptoms, "pat-name") === patName),
    [history, patName]
  );

  const load = async () => {
    if (index < 0) return;
    await loadHistoryItem(history[index], true);
  };

  if (!patName || index < 0 || patName.length < 3 || uuid === history[index].uuid) {
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
