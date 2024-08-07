import { Snackbar as MuiSnackbar } from "@mui/material";
import { useStore } from "../config/store";

export default function Snackbar() {
  const snackbar = useStore((s) => s.snackbar);
  const hideSnackbar = useStore((s) => s.hideSnackbar);

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
