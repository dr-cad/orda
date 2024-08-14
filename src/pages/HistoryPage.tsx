import {
  AddRounded,
  CalendarMonth,
  DeleteRounded,
  EditRounded,
  PrintRounded,
  SearchRounded,
  SortByAlpha,
  SwapVert,
  Visibility,
} from "@mui/icons-material";
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
import { MouseEvent, useMemo, useState } from "react";
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
  const history = useStore((s) => s.history);
  const [query, setQuery] = useState("");
  const [sortType, setSortType] = useState(SortType.Created);
  const [sortDir, setSortDir] = useState(SortDir.Desc);

  const handleChange = (v: string) => setQuery(v);

  const { handleNewRecord } = useAppHistory();

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

  return (
    <Stack aria-label="diseases-page" flex={1} p={2} gap={2} position="relative">
      <TextField
        className="sticky blur-bg"
        sx={{ top: 20, zIndex: 99 }}
        size="small"
        type="text"
        placeholder="Search a name"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ opacity: 0.15 }}>
              <SearchRounded />
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
          startIcon={<AddRounded />}
          sx={{ borderRadius: 4, px: 2 }}>
          New Record
        </Button>

        <Box flex={1} />

        <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
          <Tooltip title="By name">
            <IconButton
              size="small"
              sx={{ color: sortType === SortType.AZ ? "#fff" : "#fff5" }}
              color="inherit"
              onClick={() => setSortType(SortType.AZ)}>
              <SortByAlpha fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="By date">
            <IconButton
              size="small"
              sx={{ color: sortType === SortType.Created ? "#fff" : "#fff5" }}
              color="inherit"
              onClick={() => setSortType(SortType.Created)}>
              <CalendarMonth fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={sortDir === SortDir.Desc ? "Descending" : "Ascending"}>
            <IconButton
              size="small"
              sx={{ color: sortDir === SortDir.Desc ? "#fff" : "#fff5" }}
              color="inherit"
              onClick={() => setSortDir((s) => (s === SortDir.Desc ? SortDir.Asc : SortDir.Desc))}>
              <SwapVert fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <List sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {list.map((item, i) => (
          <HistoryItem key={i} index={i} {...item} />
        ))}
      </List>
    </Stack>
  );
}

const HistoryItem = ({ index, ...item }: IHistoryItem & { index: number }) => {
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
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#ffffff12",
        },
      }}
      onClick={!isDraft ? handleLoad : handleEdit}
      secondaryAction={
        <Box display="flex" flexDirection="row" gap={1}>
          {!isDraft && !reportDisabled && (
            <Tooltip title="Report">
              <IconButton size="small" color="primary" onClick={handleReport}>
                <PrintRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!isDraft && (
            <Tooltip title="Results">
              <IconButton size="small" color="success">
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <IconButton size="small" color="warning" onClick={handleEdit}>
              <EditRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={handleRemove}>
              <DeleteRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }>
      <Box flex="0 0 8px" />
      <ListItemText
        primary={title.toString()}
        secondary={isDraft ? "(unsaved draft)" : moment(item.createdAt).format("DD MMM YYYY")}
        secondaryTypographyProps={{ fontSize: "0.65rem", color: isDraft ? "warning.main" : "#fff6" }}
      />
    </ListItem>
  );
};
