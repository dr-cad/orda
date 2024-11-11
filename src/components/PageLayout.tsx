import { Stack } from "@mui/material";
import Header from "./Header";
import Pagination from "./Pagination";

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack
      className="layout"
      overflow="hidden"
      flex={1}
      mt="env(safe-area-inset-top, 0px)"
      justifyContent="space-between"
      alignItems="stretch"
      position="relative"
      sx={{ overflowY: "scroll" }}>
      <Header />
      {children}
      <Pagination />
    </Stack>
  );
}
