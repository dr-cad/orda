import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import _ from "lodash";
import moment from "moment";
import { memo, MouseEvent, MouseEventHandler, useDeferredValue, useMemo, useState } from "react";
import {
  FcAlphabeticalSortingAz,
  FcAlphabeticalSortingZa,
  FcAreaChart,
  FcCalendar,
  FcDown,
  FcFullTrash,
  FcPlus,
  FcPrint,
  FcSearch,
  FcUp,
} from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useStore } from "../config/store";
import { appName } from "../config/strings";
import useAppHistory from "../hooks/history";
import { getSymptomsErrors, getSymptomValueById } from "../lib/symptoms";
import { getId } from "../lib/utils";
import { IHistoryItem } from "../types/interfaces";

enum SortType {
  Created,
  AZ,
}

enum SortDir {
  Desc = "desc",
  Asc = "asc",
}

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [sortType, setSortType] = useState(SortType.Created);
  const [sortDir, setSortDir] = useState(SortDir.Desc);

  const handleChange = (v: string) => setQuery(v);

  const { handleNewRecord } = useAppHistory();

  return (
    <Stack aria-label="diseases-page" flex={1} p={2} gap={2} position="relative">
      <TextField
        className="sticky blur-bg"
        sx={{ top: 20, zIndex: 99 }}
        size="small"
        type="text"
        placeholder="Search by name or id"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ opacity: 0.85 }}>
              <FcSearch fontSize="1.25rem" filter="brightness(1.5)" />
            </InputAdornment>
          ),
          disableUnderline: true,
        }}
      />

      <Box display="flex" flexWrap="wrap" gap={2}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => handleNewRecord()}
          startIcon={<FcPlus />}
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
              {sortDir === SortDir.Asc ? <FcAlphabeticalSortingAz /> : <FcAlphabeticalSortingZa />}
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

      <HistoryList query={deferredQuery} sortType={sortType} sortDir={sortDir} />
    </Stack>
  );
}

const HistoryList = memo(({ query, sortType, sortDir }: { query: string; sortType: SortType; sortDir: SortDir }) => {
  const history = useStore((s) => s.history);

  const list = useMemo(() => {
    // search
    let result = history.filter((h) => {
      const patName = getSymptomValueById<string>(h.symptoms, "pat-name");
      const matchPatName = patName?.includes(query);
      const matchUUID = h.uuid.includes(query);
      return matchPatName || matchUUID;
    });
    // sort - type, dir
    if (sortType === SortType.AZ) {
      result = _.sortBy(result, [(o) => getSymptomValueById(o.symptoms, "pat-name") || "zzz"]);
    }
    if (sortType === SortType.Created) {
      result = _.orderBy(result, [(o) => o.createdAt], ["desc"]);
    }
    if (sortDir === SortDir.Asc) _.reverse(result);
    return result;
  }, [history, query, sortType, sortDir]);

  const [selection, setSelection] = useState<number[]>([]);

  const handleSelect = (e: MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("here", i);
    setSelection((s) => {
      if (s.includes(i)) return _.filter(s, (x) => x !== i);
      return _.uniq([...s, i]);
    });
  };

  return (
    <List sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
      {list.map((item, i) => (
        <HistoryItem
          key={i}
          index={i}
          selected={selection.includes(i)}
          handleSelect={(e) => handleSelect(e, i)}
          {...item}
        />
      ))}
    </List>
  );
});

const HistoryItem = ({
  index,
  selected,
  handleSelect,
  ...item
}: IHistoryItem & { index: number; selected: boolean; handleSelect: MouseEventHandler }) => {
  const navigate = useNavigate();
  const removeHistory = useStore((s) => s.removeHistory);
  const loadHistory = useStore((s) => s.loadHistory);
  const reportDisabled = useMemo(() => getSymptomsErrors(item.symptoms).length, [item.symptoms]);

  const title = useMemo(() => {
    return getSymptomValueById<string>(item.symptoms, "pat-name") || appName;
  }, [item.symptoms]);

  const handleLoadAndGo = (e: MouseEvent, to: string) => {
    e.preventDefault();
    e.stopPropagation();
    loadHistory(item);
    navigate(to);
  };

  const handleReport = (e: MouseEvent) => {
    handleLoadAndGo(e, "/report/" + getId(item.uuid));
  };

  const handleLoad = (e: MouseEvent) => {
    handleLoadAndGo(e, "/result/" + getId(item.uuid));
  };

  const handleEdit = (e: MouseEvent) => {
    handleLoadAndGo(e, "/list/1");
  };

  const handleRemove = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeHistory(item.uuid);
  };

  const isDraft = !item.scores;

  return (
    <ListItem
      sx={{
        // borderBottom: "var(--app-border)",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff08",
        borderRadius: 3,
        border: selected ? "2px dashed #fff5" : undefined,
        boxSizing: "border-box",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#ffffff12",
        },
      }}
      onClick={handleEdit}
      onContextMenu={handleSelect}
      secondaryAction={
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          {!isDraft && !reportDisabled && (
            <Tooltip title="Report">
              <IconButton size="small" color="primary" onClick={handleReport}>
                <FcPrint fontSize="1.25rem" />
              </IconButton>
            </Tooltip>
          )}
          {!isDraft && (
            <Tooltip title="Results" onClick={handleLoad}>
              <IconButton size="small" color="success">
                <FcAreaChart fontSize="1.25rem" />
              </IconButton>
            </Tooltip>
          )}
          <Box flex="0 0 1px" sx={{ height: "1.5rem", bgcolor: "#fff2" }} />
          <Tooltip title="Delete">
            <IconButton size="small" onClick={handleRemove}>
              <FcFullTrash fontSize="large" filter="hue-rotate(90deg)" />
            </IconButton>
          </Tooltip>
        </Box>
      }>
      <Box flex="0 0 6px" />
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 7,
          mr: 1,
          bgcolor: isDraft ? "#fff2" : reportDisabled ? "warning.dark" : "primary.dark",
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }}
      />
      <ListItemText
        primary={title.toString()}
        secondary={isDraft ? "(unsaved draft)" : moment(item.createdAt).format("DD MMM YYYY")}
        secondaryTypographyProps={{ fontSize: "0.65rem", color: isDraft ? "warning.main" : "#fff6" }}
      />
    </ListItem>
  );
};
