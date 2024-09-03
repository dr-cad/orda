import { ExpandLessRounded, ExpandMoreRounded } from "@mui/icons-material";
import TreeView from "@mui/lab/TreeView";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useMemo } from "react";
import SymptomsGroup from "../components/Symptom";
import { CloseSquare, MinusSquare, PlusSquare } from "../components/styled";
import { useBufferStore } from "../config/store";
import { usePageIndex } from "../hooks/pages";

function SymptomsPage() {
  const { currPage } = usePageIndex();
  const collapsed = useBufferStore((s) => s.collapsed);
  const collapseAll = useBufferStore((s) => s.collapseAll);
  const expandAll = useBufferStore((s) => s.expandAll);
  const symptoms = useBufferStore((s) => s.symptoms);

  const expanded = useMemo(() => {
    const expandedSet = new Set<string>();
    symptoms.forEach((i) => {
      if (i.open) expandedSet.add(i.id);
    });
    return Array.from(expandedSet);
  }, [symptoms]);

  if (!currPage) return <p>404</p>;

  return (
    <Stack flex={1} sx={{ height: "fit-content", position: "relative" }}>
      <Stack
        aria-label="symptom-page-header"
        direction="row"
        alignItems="center"
        sx={{ py: 2, px: 2.5, pl: 3.5, top: 0, position: "sticky", zIndex: 100, backdropFilter: "blur(10px)" }}>
        <Stack>
          <Typography variant="h5" textTransform="capitalize" fontWeight={700} sx={{ whiteSpace: "pre-line" }}>
            {currPage.name}
          </Typography>
          <Typography variant="subtitle2" fontWeight={500} sx={{ opacity: 0.45 }}>
            {typeof currPage.desc === "string" ? currPage.desc : null}
          </Typography>
        </Stack>
        <Box flex="1 0 0" />
        <Tooltip title={!collapsed ? "Collapse all" : "Expand all"}>
          <IconButton
            size="small"
            color={!collapsed ? "warning" : "default"}
            onClick={!collapsed ? collapseAll : expandAll}>
            {!collapsed ? <ExpandLessRounded /> : <ExpandMoreRounded />}
          </IconButton>
        </Tooltip>
      </Stack>
      <TreeView
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
        expanded={expanded}
        selected={[]}
        onNodeSelect={() => {}}
        onNodeToggle={() => {}}
        sx={{ height: "fit-content", px: 2 }}>
        <SymptomsGroup symptom={currPage} />
      </TreeView>
    </Stack>
  );
}

export default SymptomsPage;
