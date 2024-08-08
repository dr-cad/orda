import { PrintOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useStore } from "../config/store";
import { getId } from "../lib/utils";
import { IHistoryItem } from "../types/interfaces";
import { getSymptomsErrors } from "../lib/symptoms";

export default function ReportIcon() {
  const symptoms = useStore((s) => s.symptoms);
  const history = useStore((s) => s.history);
  const item: IHistoryItem = useMemo(() => history[0], [history]);
  const errors = useMemo(() => getSymptomsErrors(symptoms), [symptoms]);

  if (!item) return null;

  const disabled = !!errors.length;

  return (
    <Tooltip title={!disabled ? "Print Report" : "Please fill the requirements to print report"}>
      {disabled ? (
        <span>
          <IconButton disabled>
            <PrintOutlined />
          </IconButton>
        </span>
      ) : (
        <NavLink to={"/report/" + getId(item.uuid)}>
          <IconButton>
            <PrintOutlined />
          </IconButton>
        </NavLink>
      )}
    </Tooltip>
  );
}
