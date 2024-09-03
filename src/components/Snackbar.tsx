import { Snackbar as MuiSnackbar } from "@mui/material";
import { useBufferStore } from "../config/store";

export default function Snackbar() {
  const snackbar = useBufferStore((s) => s.snackbar);
  const hideSnackbar = useBufferStore((s) => s.hideSnackbar);

  return (
    <MuiSnackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={!!snackbar}
      onClose={hideSnackbar}
      message={snackbar?.message}
      autoHideDuration={3000}
      ContentProps={{ sx: { backgroundColor: snackbar?.color || "primary.main" } }}
    />
  );
}
