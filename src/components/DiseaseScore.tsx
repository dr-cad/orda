import { ListItem, ListItemText, Typography } from "@mui/material";
import { AppMode, IDiseaseScored } from "../types";

export default function DiseaseScore({
  value,
  name,
  pvalue,
  index,
  mode,
}: IDiseaseScored & { index: number; mode: AppMode }) {
  return (
    <>
      <ListItem
        sx={{
          justifyContent: "space-between",
          opacity: index < 3 ? 1 : 0.35,
          borderBottom: "var(--app-border)",
        }}>
        <ListItemText primary={name} />
        {mode === AppMode.Preval ? (
          <>
            <Typography sx={{ textAlign: "end" }}>{(pvalue * 100).toFixed(0)}%</Typography>
            <Typography sx={{ textAlign: "end", opacity: 0.5, ml: 1 }} fontSize="0.75rem">
              ({(value * 100).toFixed(0)}%)
            </Typography>
          </>
        ) : (
          <>
            <Typography sx={{ textAlign: "end" }}>{(value * 100).toFixed(0)}%</Typography>
            <Typography sx={{ textAlign: "end", opacity: 0.5, ml: 1 }} fontSize="0.75rem">
              ({(pvalue * 100).toFixed(0)}%)
            </Typography>
          </>
        )}
      </ListItem>
    </>
  );
}
