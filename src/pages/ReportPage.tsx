import { ChevronRightRounded } from "@mui/icons-material";
import { Box, Button, IconButton, Stack } from "@mui/material";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { FcCamera, FcPrint, FcShare } from "react-icons/fc";
import { Link, Navigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import BarChart from "../components/BarChart";
import "../config/report.css";
import { useStore } from "../config/store";
import { appName, email, orgName, siteURL } from "../config/strings";
import useReportFindings from "../hooks/report";
import useScores from "../hooks/scores";
import { useSymptomValueOf } from "../hooks/symptom";
import { handleDownloadImage, handleShareImage } from "../lib/share";
import { getSymptomsErrors } from "../lib/symptoms";
import { getFilename, sleep } from "../lib/utils";
import { AppMode, ICImage, IHistoryItem } from "../types/interfaces";

type Mode = "print" | "image";

const CONTENT_WIDTH = 595;

export default function ReportPage() {
  const { id } = useParams();
  const history = useStore((s) => s.history);

  const item = useMemo(() => (id ? history.find((x) => x.uuid.startsWith(id)) : undefined), [history, id]);

  if (!item || !item.scores) return null;
  const disabled = useMemo(() => getSymptomsErrors(item.symptoms).length, [item.symptoms]);
  if (disabled) return <Navigate to="/result" replace />;
  return <ReportPageContent id={id!} item={item} />;
}

function ReportPageContent({ id, item }: { id: string; item: IHistoryItem }) {
  const ref = useRef<HTMLDivElement>(null!);
  const content = useRef<HTMLDivElement>(null!);

  const canResize = useRef(true);

  const scaleToFit = (mode?: Mode) => {
    if (!canResize.current && !mode) return;
    const parent = ref.current.getBoundingClientRect();
    let scale = Math.min(parent.width / CONTENT_WIDTH, 1); // default
    if (mode === "print") scale = CONTENT_WIDTH / (parent.width + 4);
    if (mode === "image") scale = 1;
    content.current.style.setProperty("scale", scale.toString());
  };

  useEffect(() => {
    if (!ref.current) return;
    scaleToFit();
    const observer = new ResizeObserver(() => scaleToFit());
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const setNoPrintVisible = (v: boolean) => {
    const elements = document.getElementsByClassName("no-print");
    for (const el of elements) {
      (el as any).style.visibility = v ? "hidden" : "visible";
    }
  };

  const onBeforeAction = async (mode?: Mode) => {
    canResize.current = false;
    scaleToFit(mode);
    setNoPrintVisible(false);
    await sleep(150);
  };

  const onAfterAction = () => {
    canResize.current = true;
    scaleToFit();
    setNoPrintVisible(true);
  };

  // ui values

  const [panaromicImageIndex, setPanaromicImageIndex] = useState(0);

  const patName = useSymptomValueOf<string>(item.symptoms, "pat-name");
  const patMale = useSymptomValueOf<string>(item.symptoms, "pat-male");
  const patAge = useSymptomValueOf<number>(item.symptoms, "pat-age");
  const panaromicImages = useSymptomValueOf<string>(item.symptoms, "panaromic-images");

  const images = useMemo<ICImage[] | undefined>(() => {
    if (!panaromicImages) return;
    return JSON.parse(panaromicImages);
  }, [panaromicImages]);

  const image = useMemo(() => {
    if (!images) return;
    if (panaromicImageIndex > images.length - 1) return;
    return images[panaromicImageIndex];
  }, [images, panaromicImageIndex]);

  const findings = useReportFindings(item.symptoms);

  const { scores, barChartData } = useScores(item.scores!, AppMode.Preval, 3);

  // events

  const handlePrint = useReactToPrint({
    content: () => ref.current,
    onBeforeGetContent: () => onBeforeAction("print"),
    onAfterPrint: onAfterAction,
  });

  const handleDownload = async () => {
    await onBeforeAction("image");
    const filename = getFilename("Report", patName || appName, id, "png");
    await handleDownloadImage(content.current!, filename);
    onAfterAction();
  };

  const handleShare = async () => {
    await onBeforeAction("image");
    const filename = getFilename("Report", patName || appName, id, "png");
    await handleShareImage(content.current, filename, "Patient Report", "white");
    onAfterAction();
  };

  return (
    <Stack aria-label="report-wrapper" flex={1} p={2} gap={3}>
      <div ref={ref} className="report">
        <div ref={content} className="content">
          <div className="content-inner">
            <section className="header">
              <div className="info">
                <h1>Radiology Report Summary</h1>
                <span>
                  <span>
                    <strong>Serial No:</strong> &nbsp;{id}
                  </span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span>
                    <strong>Date:</strong> &nbsp;{moment(item.createdAt).format("DD MMM YYYY")}
                  </span>
                </span>
                <h1 className="pat-name">{patName}</h1>
                <span className="pat-info">
                  {patMale ? "male" : "female"} / {patAge}
                </span>
              </div>
              <div className="logo">
                <img alt={appName} src="/logo-report.png" />
                <img alt={orgName} src="/script.svg" />
              </div>
            </section>

            {images && image && (
              <section
                className="panaromic-images"
                onClick={() => setPanaromicImageIndex((s) => (s + 1) % images.length)}>
                <img alt={patName} src={image.url} />
                {images.length > 1 && (
                  <IconButton
                    className="next-btn no-print"
                    sx={{
                      backgroundColor: "#0008",
                      "&:hover": { backgroundColor: "#0005" },
                    }}>
                    <ChevronRightRounded />
                  </IconButton>
                )}
              </section>
            )}

            <section>
              <h4>Imaging Findings</h4>
              <p contentEditable className="text-wrap">
                {findings}
              </p>
            </section>

            <section>
              <Box
                display="flex"
                gap={2}
                // sx={{ overflowX: "hidden", overflowY: "visible" }}
                justifyContent="space-between">
                <Box>
                  <h4>Differentiated Diagnosis</h4>
                  <ol>
                    {scores.slice(0, 5).map((score, i) => (
                      <li key={i}>{score.name} </li>
                    ))}
                  </ol>
                </Box>
                <Box flex="0 0 50%" height="11.75rem" mt={-4} mb={-2}>
                  <BarChart data={barChartData} darkMode={false} compact />
                </Box>
              </Box>
            </section>

            <section className="advice text-wrap">
              <h4>Advice:</h4>
              <span className="advice-dashes" contentEditable />
            </section>

            <section className="footer">
              <Box flex={1} className="signature">
                <span>Name & Signature</span>
              </Box>
              <Stack flex="0 0 auto" mr={2}>
                <span>
                  <strong>Website:</strong> &nbsp;{siteURL}
                </span>
                <span>
                  <strong>Email:</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <Link to={"mailto:" + email}>{email}</Link>
                </span>
              </Stack>
            </section>
          </div>
        </div>
      </div>

      <Box display="flex" justifyContent="center" gap={2}>
        <Button onClick={handlePrint} color="inherit" startIcon={<FcPrint />} sx={{ fontSize: "0.65rem" }}>
          Print
        </Button>
        <Button onClick={handleDownload} color="inherit" startIcon={<FcCamera />} sx={{ fontSize: "0.65rem" }}>
          Save
        </Button>
        <Button onClick={handleShare} color="inherit" startIcon={<FcShare />} sx={{ fontSize: "0.65rem" }}>
          Share
        </Button>
      </Box>
    </Stack>
  );
}
