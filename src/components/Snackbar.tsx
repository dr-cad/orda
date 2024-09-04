import { Alert, Box, CircularProgress, Snackbar as MuiSnackbar } from "@mui/material";
import { useMemo } from "react";
import { useBufferStore } from "../config/store";

export default function Snackbar() {
  const snackbar = useBufferStore((s) => s.snackbar);
  const hideSnackbar = useBufferStore((s) => s.hideSnackbar);

  const open = useMemo(() => !!snackbar, [snackbar]);
  const message = useMemo(() => snackbar?.message, [snackbar?.message]);
  const severity = useMemo(() => snackbar?.severity, [snackbar?.severity]);
  const progress = useMemo(() => snackbar?.progress, [snackbar?.progress]);

  return (
    <MuiSnackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      onClose={hideSnackbar}
      autoHideDuration={3000}>
      <Alert onClose={hideSnackbar} severity={severity ?? "info"}>
        <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
          {message}
          {!!progress && <CircularProgress variant="determinate" size="1rem" value={progress} />}
        </Box>
      </Alert>
    </MuiSnackbar>
  );
}
