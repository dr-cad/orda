// buttons:
// start new
// load history from file

import { AddRounded, UploadFileOutlined } from "@mui/icons-material";
import Logo from "../components/favicon.svg?react";

import { Box, Button, Stack, Typography } from "@mui/material";
import useAppHistory from "../hooks/history";
import { useStore } from "../config/store";
import { redirect } from "react-router-dom";

export default function IntroPage() {
  const history = useStore((s) => s.history);
  const { handleImportHistory, handleNewRecord } = useAppHistory();

  if (history.length > 3) {
    redirect("/history");
  }

  return (
    <Stack aria-label="intro-wrapper" flex={1} maxWidth={350} alignItems="center" textAlign="center" mx="auto">
      <Box flex={1} />
      <Logo style={{ height: "15rem", width: "auto" }} />
      <Typography variant="h3">Welcome to Oral Diagnosis App</Typography>
      <Box flex={1} />
      {/* <Typography variant="body2">Select and option to get started</Typography> */}
      <Button
        onClick={() => handleNewRecord(false)}
        variant="contained"
        startIcon={<AddRounded />}
        sx={{ borderRadius: 4, px: 2 }}>
        <Typography className="text-ellipsis">Create a New Record</Typography>
      </Button>
      <Box flex="0 0 0.85rem" />
      <Button onClick={handleImportHistory} startIcon={<UploadFileOutlined />} sx={{ borderRadius: 4, px: 2 }}>
        <Typography className="text-ellipsis">Import Backup</Typography>
      </Button>
      <Box flex={1} />
    </Stack>
  );
}
