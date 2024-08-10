import { Stack } from "@mui/material";
import Header from "./Header";
import Pagination from "./Pagination";
import Snackbar from "./Snackbar";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      overflow="hidden"
      flex={1}
      mt="env(safe-area-inset-top, 0px)"
      justifyContent="space-between"
      alignItems="stretch"
      position="relative"
      sx={{ height: "100dvh", overflowY: "scroll", overflowX: "hidden" }}>
      <Header />
      {children}
      <Pagination />
      <Snackbar />
    </Stack>
  );
}
