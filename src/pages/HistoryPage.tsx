import { Box, Button, IconButton, InputAdornment, Stack, TextField, Tooltip } from "@mui/material";
import { useDeferredValue, useState } from "react";
import {
  FcAlphabeticalSortingAz,
  FcAlphabeticalSortingZa,
  FcCalendar,
  FcDown,
  FcPlus,
  FcSearch,
  FcUp,
} from "react-icons/fc";
import HistoryList from "../components/HistoryList";
import useAppHistory from "../hooks/history";
import { SortDir, SortType } from "../types";

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [sortType, setSortType] = useState(SortType.Created);
  const [sortDir, setSortDir] = useState(SortDir.Desc);
  const { handleNewRecord } = useAppHistory();

  return (
    <Stack aria-label="history-page" flex={1} gap={2} position="relative">
      <TextField
        className="sticky blur-bg"
        sx={{ top: 20, zIndex: 99, pt: 1, mx: 2, mt: 2 }}
        size="small"
        type="text"
        placeholder="Search by name or id"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ opacity: 0.85 }}>
              <FcSearch fontSize="1.25rem" filter="brightness(1.5)" />
            </InputAdornment>
          ),
          disableUnderline: true,
        }}
      />

      <Box display="flex" flexWrap="wrap" gap={2} mx={2}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => handleNewRecord()}
          startIcon={<FcPlus filter="contrast(4) hue-rotate(300deg)" />}
          sx={{ borderRadius: 4, px: 2 }}>
          New Record
        </Button>

        <Box flex={1} />

        <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
          <Tooltip title="By name">
            <IconButton
              size="small"
              sx={{
                filter: sortType === SortType.AZ ? "none" : "grayscale(1)",
                fontSize: "1.25rem",
              }}
              color="inherit"
              onClick={() => setSortType(SortType.AZ)}>
              {sortDir === SortDir.Desc ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />}
            </IconButton>
          </Tooltip>
          <Tooltip title="By date">
            <IconButton
              size="small"
              sx={{
                filter: sortType === SortType.Created ? "none" : "grayscale(1)",
                fontSize: "1.25rem",
              }}
              color="inherit"
              onClick={() => setSortType(SortType.Created)}>
              <FcCalendar filter="hue-rotate(180deg)" />
            </IconButton>
          </Tooltip>
          <Tooltip title={sortDir === SortDir.Desc ? "Descending" : "Ascending"}>
            <IconButton
              size="small"
              color="inherit"
              sx={{ fontSize: "1.25rem" }}
              onClick={() => setSortDir((s) => (s === SortDir.Desc ? SortDir.Asc : SortDir.Desc))}>
              {sortDir === SortDir.Desc ? <FcDown /> : <FcUp />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box flex={1}>
        <HistoryList query={deferredQuery} sortType={sortType} sortDir={sortDir} />
      </Box>
    </Stack>
  );
}
