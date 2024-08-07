import { HistoryRounded, HomeOutlined, SaveOutlined, UploadFileOutlined } from "@mui/icons-material";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import useAppHistory from "../hooks/history";
import { ReactComponent as Logo } from "./favicon.svg";
import NewRecordButton from "./NewRecordButton";
import ReportIcon from "./ReportIcon";

export default function Header() {
  const { pathname } = useLocation();

  const { handleImportHistory, handleExportHistory } = useAppHistory();

  const inIntro = useMemo(() => pathname.startsWith("/intro"), [pathname]);
  const inList = useMemo(() => pathname.startsWith("/list"), [pathname]);
  const inResult = useMemo(() => pathname.startsWith("/result"), [pathname]);
  const inHistory = useMemo(() => pathname.startsWith("/history"), [pathname]);

  if (inIntro) return null;

  return (
    <Stack
      aria-label="app-header"
      direction="row"
      gap={2}
      justifyContent="center"
      alignItems="center"
      height={66}
      px={2}
      className="blur-bg"
      flexShrink={0}
      top={0}
      zIndex={99}
      borderBottom="var(--app-border)">
      <Stack flex="0 1 100%" direction="row" alignItems="center" justifyContent="flex-start" overflow="hidden">
        {inList && <NewRecordButton size="small" sx={{ fontSize: "0.75rem" }} draft />}
        {inResult && <ReportIcon />}
        {inHistory && (
          <Tooltip title="Import History">
            <IconButton onClick={handleImportHistory}>
              <UploadFileOutlined />
            </IconButton>
          </Tooltip>
        )}
        {inHistory && (
          <Tooltip title="Export History">
            <IconButton onClick={handleExportHistory}>
              <SaveOutlined />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <NavLink
        to="/"
        style={{ flex: "0 1 100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Logo style={{ height: "2.5rem", width: "auto" }} />
        <Typography fontWeight={600} color="text">
          ORDA
        </Typography>
      </NavLink>
      <Stack flex="0 1 100%" gap={0.25} direction="row" justifyContent="flex-end" alignItems="center">
        {(inList || inResult) && (
          <NavLink to="/history">
            <IconButton>
              <HistoryRounded />
            </IconButton>
          </NavLink>
        )}
        {inHistory && (
          <NavLink to="/list/1">
            <IconButton>
              <HomeOutlined />
            </IconButton>
          </NavLink>
        )}
      </Stack>
    </Stack>
  );
}
