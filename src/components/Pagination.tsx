import { Done } from "@mui/icons-material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Pagination as MuiPagination, PaginationItem, Stack, paginationItemClasses } from "@mui/material";
import { usePageIndex } from "../hooks/pages";

export default function Pagination() {
  const { show, pages, isResult, canGoForward, handleTo, handleResult, pageIndex } = usePageIndex();

  return !show ? null : (
    <Stack
      py={2}
      direction="row"
      gap={1}
      justifyContent="center"
      alignItems="center"
      className="blur-bg sticky"
      sx={{ position: "relative", bottom: 0, zIndex: 100 }}>
      <MuiPagination
        count={pages.length}
        page={pageIndex + 1}
        color="primary"
        shape="rounded"
        hidePrevButton
        onChange={(e, p) => {
          handleTo(p);
        }}
        renderItem={(item) => {
          const isNext = item.type === "next";
          const isDone = isNext && !canGoForward;
          return (
            <PaginationItem
              slots={{ next: canGoForward ? ChevronRightIcon : Done }}
              {...item}
              disabled={isDone ? false : item.disabled}
              onClick={isDone ? handleResult : item.onClick}
              selected={isResult ? isDone : item.selected}
              sx={{
                [`&.${paginationItemClasses.root}, &.${paginationItemClasses.root}:hover`]: {
                  backgroundColor: isResult && isDone ? "success.main" : undefined,
                },
              }}
            />
          );
        }}
      />
    </Stack>
  );
}
