import { Button, Tooltip } from "@mui/material";
import { useMemo } from "react";
import { FcPrint } from "react-icons/fc";
import { NavLink } from "react-router-dom";
import { useStore } from "../config/store";
import { getSymptomsErrors } from "../lib/symptoms";
import { getId } from "../lib/utils";
import { IHistoryItem } from "../types";

export default function ReportIcon() {
  const symptoms = useStore((s) => s.symptoms);
  const history = useStore((s) => s.history);
  const item: IHistoryItem = useMemo(() => history[0], [history]);
  const disabled = useMemo(() => getSymptomsErrors(symptoms).length, [symptoms]);

  if (!item) return null;

  return (
    <Tooltip title={!disabled ? "Print Report" : "Please fill the requirements to print report"}>
      {disabled ? (
        <span>
          <Button
            disabled
            startIcon={<FcPrint />}
            color="inherit"
            sx={{ borderRadius: 4, px: 2, lineHeight: "0.5em", color: "info.light" }}>
            Report
          </Button>
        </span>
      ) : (
        <NavLink to={"/report/" + getId(item.uuid)}>
          <Button
            startIcon={<FcPrint />}
            color="inherit"
            sx={{ borderRadius: 4, px: 2, lineHeight: "0.5em", color: "info.light" }}>
            Report
          </Button>
        </NavLink>
      )}
    </Tooltip>
  );
}
