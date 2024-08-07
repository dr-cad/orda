import { Stack } from "@mui/material";
import Header from "./Header";
import Pagination from "./Pagination";
import Snackbar from "./Snackbar";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight;
  return (
    <Stack
      overflow="hidden"
      flex={1}
      mt="env(safe-area-inset-top)"
      justifyContent="space-between"
      alignItems="stretch"
      position="relative"
      sx={{ height: [vh, "100vh"], overflowY: "auto", overflowX: "hidden" }}>
      <Header />
      {children}
      <Pagination />
      <Snackbar />
    </Stack>
  );
}
