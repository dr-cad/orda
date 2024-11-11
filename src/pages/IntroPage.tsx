import { AddRounded, UploadFileOutlined } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Stack, Typography } from "@mui/material";
import { RiRobot2Line } from "react-icons/ri";
import Logo from "../components/favicon.svg?react";
import useAI from "../hooks/ai";
import useAppHistory from "../hooks/history";

export default function IntroPage() {
  const { handleImportHistory, handleNewRecord } = useAppHistory();
  const { handleNewAi } = useAI();

  return (
    <Stack aria-label="intro-wrapper" flex={1} maxWidth={350} alignItems="center" textAlign="center" mx="auto">
      <Box flex={1} />
      <Logo style={{ height: "15rem", width: "auto" }} />
      <Typography variant="h3">Welcome to Oral Diagnosis App</Typography>
      <Box flex={1} />
      {/* <Typography variant="body2">Select and option to get started</Typography> */}
      <ButtonGroup>
        <Button
          onClick={handleNewRecord}
          variant="contained"
          startIcon={<AddRounded />}
          sx={{ borderRadius: 4, px: 2 }}>
          Create
        </Button>
        <Button
          onClick={handleNewAi}
          variant="contained"
          color="info"
          endIcon={<RiRobot2Line />}
          sx={{ borderRadius: 4, px: 2 }}>
          AI
        </Button>
      </ButtonGroup>
      <Box flex="0 0 0.85rem" />
      <Button onClick={handleImportHistory} startIcon={<UploadFileOutlined />} sx={{ borderRadius: 4, px: 2 }}>
        <Typography className="text-ellipsis">Import backup</Typography>
      </Button>
      <Box flex={1} />
    </Stack>
  );
}
