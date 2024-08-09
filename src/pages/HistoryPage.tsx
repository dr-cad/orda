import { AddRounded, DeleteRounded, EditRounded, SearchRounded } from "@mui/icons-material";
import { Box, Button, IconButton, InputAdornment, List, ListItem, ListItemText, Stack, TextField } from "@mui/material";
import moment from "moment";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../config/store";
import useAppHistory from "../hooks/history";
import { getSymptomValueById } from "../lib/symptoms";
import { getId } from "../lib/utils";
import { IHistoryItem } from "../types/interfaces";

export default function HistoryPage() {
  const history = useStore((s) => s.history);
  const [query, setQuery] = useState("");
  const handleChange = (v: string) => setQuery(v);

  const { handleNewRecord } = useAppHistory();

  const list = useMemo(
    () =>
      history.filter((h) => {
        const patName = h.symptoms.find((s) => s.id === "pat-name")?.value as string | undefined;
        const matchPatName = patName?.includes(query);
        const matchUUID = h.uuid.includes(query);
        return matchPatName || matchUUID;
      }),
    [history, query]
  );

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
      <Button fullWidth onClick={() => handleNewRecord(true)} startIcon={<AddRounded />} sx={{ borderRadius: 4 }}>
        New Record
      </Button>
      <List sx={{ gap: 1, display: "flex", flexDirection: "column" }}>
        {list.map((item, i) => (
          <HistoryItem key={i} index={i} {...item} />
        ))}
      </List>
    </Stack>
  );
}

const HistoryItem = ({ index, ...item }: IHistoryItem & { index: number }) => {
  const nav = useNavigate();
  const { saveDraft } = useAppHistory();
  const remove = useStore((s) => s.removeHistory);
  const load = useStore((s) => s.loadHistory);
  const showSnackbar = useStore((s) => s.showSnackbar);

  const title = useMemo(() => {
    const patName = getSymptomValueById(item.symptoms, "pat-name");
    return patName || "ORDA";
  }, [item.symptoms]);

  const handleLoad: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveDraft(); // draft current data before loading the item
    load(item);
    nav("/result/" + getId(item.uuid));
    showSnackbar("History record loaded!");
  };

  const handleEdit: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveDraft(); // draft current data before loading the item
    load(item);
    nav("/list/1");
    showSnackbar("History record loaded!");
  };

  const handleRemove: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    remove(index);
    showSnackbar("History record removed!");
  };

  return (
    <ListItem
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        // borderBottom: "var(--app-border)",
        backgroundColor: "#ffffff08",
        borderRadius: 3,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#ffffff12",
        },
      }}
      onClick={handleLoad}
      secondaryAction={
        <Box display="flex" flexDirection="row" gap={1}>
          <IconButton size="small" color="primary" onClick={handleEdit}>
            <EditRounded fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={handleRemove}>
            <DeleteRounded fontSize="small" />
          </IconButton>
        </Box>
      }>
      <Box flex="0 0 8px" />
      <ListItemText
        primary={title.toString()}
        secondary={item.unsaved ? "(unsaved draft)" : moment(item.createdAt).format("DD MMM YYYY")}
        secondaryTypographyProps={{ fontSize: "0.65rem", color: item.unsaved ? "warning.main" : "#fff6" }}
      />
    </ListItem>
  );
};
