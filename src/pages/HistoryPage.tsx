import { AddRounded, CloseRounded, SearchRounded } from "@mui/icons-material";
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
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../config/store";
import useAppHistory from "../hooks/history";
import { getSymptomValueById } from "../lib/symptoms";
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
      <List>
        {list.map((item, i) => (
          <HistoryItem key={i} index={i} {...item} />
        ))}
      </List>
      <Button fullWidth onClick={() => handleNewRecord(true)} startIcon={<AddRounded />} sx={{ borderRadius: 4 }}>
        New Record
      </Button>
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
    nav("/result");
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
        borderBottom: "var(--app-border)",
        cursor: "pointer",
      }}
      onClick={handleLoad}>
      <IconButton size="small" color="error" onClick={handleRemove}>
        <CloseRounded fontSize="small" />
      </IconButton>
      <Box flex="0 0 8px" />
      <ListItemText
        primary={title.toString()}
        secondary={item.unsaved ? "(unsaved draft)" : undefined}
        secondaryTypographyProps={{ fontSize: "0.65rem", color: "warning.main" }}
      />
      <Typography fontSize="0.75rem" sx={{ textAlign: "end", opacity: 0.55 }}>
        {new Date(item.createdAt).toUTCString()}
      </Typography>
    </ListItem>
  );
};
