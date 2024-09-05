import { Button, Tooltip } from "@mui/material";
import { FcPrint } from "react-icons/fc";
import { NavLink, useParams } from "react-router-dom";
import { useHistoryItem } from "../hooks/history";
import { getId } from "../lib/utils";

export default function ReportIcon() {
  const { id } = useParams();
  const item = useHistoryItem(id);
  const disabled = !!item?.errors?.length;

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
