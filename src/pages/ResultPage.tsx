import { ImageOutlined, ShareOutlined, ViewKanbanRounded, ViewTimelineRounded } from "@mui/icons-material";
import { Alert, Box, IconButton, List, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BarChart from "../components/BarChart";
import DiseaseScore from "../components/DiseaseScore";
import { useStore } from "../config/store";
import { appName } from "../config/strings";
import { useHistoryItem } from "../hooks/history";
import useScores from "../hooks/scores";
import { handleShareImage, takeScreenshoot } from "../lib/share";
import { getSymptomValueById, getSymptomsErrors } from "../lib/symptoms";
import { getFilename } from "../lib/utils";
import { AppMode, IHistoryItem, Keys } from "../types";

export default function ResultPage() {
  const { id } = useParams();
  const item = useHistoryItem(id);

  if (!item || !id || !item.scores) return null; // TODO
  return <ResultPageContent id={id} item={item} />;
}

export function ResultPageContent({ id, item }: { id: string; item: IHistoryItem }) {
  const _chartBox = useRef();

  const [mode, setMode] = useState(AppMode.Preval);
  const symptoms = useStore((s) => s.symptoms);

  const { scores, barChartData } = useScores(item.scores!, mode);
  const errors = useMemo(() => getSymptomsErrors(symptoms), [symptoms]);

  const { title, patName } = useMemo(() => {
    const patName = getSymptomValueById<string>(symptoms, "pat-name");
    const patMale = getSymptomValueById(symptoms, "pat-male");
    const patFemale = getSymptomValueById(symptoms, "pat-female");
    const patAge = getSymptomValueById(symptoms, "pat-age");

    let title = "";
    if (patName) title += patName;
    if (patMale) title += " ♂";
    if (patFemale) title += " ♀";
    if (patAge) title += " " + patAge;
    return { title, patName };
  }, [symptoms]);

  const handleDownload = async () => {
    const data = await takeScreenshoot(_chartBox.current!);
    const filename = getFilename("Report", patName || appName, id, "png");
    const link = document.createElement("a");
    link.href = data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleShare = async () => {
    const filename = getFilename("Report", patName || appName, id, "png");
    await handleShareImage(_chartBox.current!, filename, "Patient result");
  };

  return (
    <Stack aria-label="diseases-page" className="xxx" flex={1} p={2} gap={2}>
      {errors.map((e, i) => (
        <Link key={i} to={e.link ?? "/result"}>
          <Alert severity={e.severity}>{e.message}</Alert>
        </Link>
      ))}

      <Box sx={{ borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <Box ref={_chartBox} height={"35vh"}>
          <BarChart data={barChartData} />
          {!!title.length && (
            <Stack
              className="abs-center-x"
              position="absolute"
              zIndex={101}
              top={10}
              borderRadius={2}
              px={1.5}
              py={0.5}>
              <Typography
                textAlign="start"
                fontSize={12}
                sx={{ maxWidth: 100, textOverflow: "ellipsis", overflow: "hidden" }}>
                {title}
              </Typography>
            </Stack>
          )}
        </Box>
        <Box sx={{ position: "absolute", top: 12, left: 12, display: "flex" }}>
          <IconButton aria-label="download-image" size="small" onClick={handleDownload} title="Download Image">
            <ImageOutlined />
          </IconButton>
          <IconButton aria-label="share-image" size="small" onClick={handleShare} title="Share Image">
            <ShareOutlined fontSize="inherit" sx={{ mx: "3px" }} />
          </IconButton>
        </Box>
      </Box>
      <ToggleButtonGroup
        aria-label="Switch Mode"
        color="primary"
        size="small"
        fullWidth
        exclusive
        value={mode}
        onChange={(_, v) => v && setMode(v)}>
        <ToggleButton value={AppMode.Preval}>
          {Keys.pval} <ViewKanbanRounded sx={{ ml: 2 }} fontSize="small" />
        </ToggleButton>
        <ToggleButton value={AppMode.Raw}>
          {Keys.raw} <ViewTimelineRounded sx={{ ml: 2 }} fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
      <Box height={4} />
      <List>
        {scores.map((score, i) => (
          <DiseaseScore key={i} index={i} mode={mode} {...score} />
        ))}
      </List>
    </Stack>
  );
}
