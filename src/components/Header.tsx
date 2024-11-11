import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useMemo } from "react";
import { FcDataBackup, FcExternal, FcInternal, FcPlus, FcSurvey } from "react-icons/fc";
import { RiRobot2Line } from "react-icons/ri";
import { NavLink, useLocation } from "react-router-dom";
import { appName } from "../config/strings";
import useAI from "../hooks/ai";
import useAppHistory from "../hooks/history";
import Logo from "./favicon.svg?react";
import ReportIcon from "./ReportIcon";

export default function Header() {
  const { pathname } = useLocation();

  const { handleImportHistory, handleExportHistory, handleNewRecord } = useAppHistory();
  const { handleNewAi } = useAI();

  const inIntro = useMemo(() => pathname.startsWith("/intro"), [pathname]);
  const inList = useMemo(() => pathname.startsWith("/list"), [pathname]);
  const inResult = useMemo(() => pathname.startsWith("/result"), [pathname]);
  const inReport = useMemo(() => pathname.startsWith("/report"), [pathname]);
  const inHistory = useMemo(() => pathname.startsWith("/history"), [pathname]);
  const inAI = useMemo(() => pathname.startsWith("/ai"), [pathname]);

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
      zIndex={99}>
      <Stack flex="0 1 100%" direction="row" alignItems="center" justifyContent="flex-start" overflow="hidden">
        {inAI && (
          <Button
            onClick={() => handleNewRecord()}
            startIcon={<FcPlus />}
            color="success"
            sx={{ borderRadius: 4, textTransform: "none", px: 2, lineHeight: "0.5em" }}>
            Manual
          </Button>
        )}
        {inList && (
          <Button
            onClick={handleNewAi}
            variant="contained"
            color="info"
            endIcon={<RiRobot2Line />}
            sx={{ borderRadius: 4, px: 2 }}>
            AI
          </Button>
        )}
        {inResult && <ReportIcon />}
        {inReport && (
          <NavLink to="/history" replace>
            <IconButton>
              <FcDataBackup />
            </IconButton>
          </NavLink>
        )}
        {inHistory && (
          <Tooltip title="Import History">
            <IconButton onClick={handleImportHistory}>
              <FcExternal />
            </IconButton>
          </Tooltip>
        )}
        {inHistory && (
          <Tooltip title="Export History">
            <IconButton onClick={handleExportHistory}>
              <FcInternal />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <NavLink
        to="/"
        style={{ flex: "0 1 100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Logo style={{ height: "2.5rem", width: "auto" }} />
        <Typography fontWeight={600} color="text">
          {appName}
        </Typography>
      </NavLink>
      <Stack flex="0 1 100%" gap={0.25} direction="row" justifyContent="flex-end" alignItems="center">
        {(inList || inResult || inAI) && (
          <NavLink to="/history">
            <IconButton size="medium">
              <FcDataBackup />
            </IconButton>
          </NavLink>
        )}
        {inHistory && (
          <NavLink to="/list/1">
            <Tooltip title="Back to List">
              <IconButton>
                <FcSurvey />
              </IconButton>
            </Tooltip>
          </NavLink>
        )}
      </Stack>
    </Stack>
  );
}
