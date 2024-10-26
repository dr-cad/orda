import { Box, Button, Stack, Typography } from "@mui/material";
import { MouseEvent, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSymptoms } from "../lib/get-symptoms";
import { useAppStore, useBufferStore } from "../store";
import { ISymptom } from "../types";

export default function ImportPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const updateSymptom = useBufferStore((s) => s.updateSymptom);
  const reset = useBufferStore((s) => s.reset);

  const symptoms = useMemo(() => {
    const output: ISymptom[] = [];
    getSymptoms().forEach((s) => {
      let value;
      const v = params.getAll(s.id);
      if (v.length === 0) return;
      else if (v.length === 1) {
        const v0 = parseFloat(v[0]);
        if (!Number.isNaN(v0)) value = v0; // number
        else if (v[0].toLowerCase() === "true") value = true; // boolean
        else if (v[0].toLowerCase() === "false") value = false; // boolean
        else value = v[0]; // string
      } else if (v.length === 2) {
        const v0 = parseFloat(v[0]);
        const v1 = parseFloat(v[1]);
        if (Number.isNaN(v0) || Number.isNaN(v1)) {
          console.log("Wrong range for: ", s.id);
          return;
        }
        value = { a: v0, b: v1 }; // range
      } else return;
      if (!value) return;
      output.push({ ...s, value });
    });
    return output;
  }, [params]);

  const handleImport = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    reset();
    symptoms.forEach((s) => {
      updateSymptom(s.id, s.value!); // sure they have value
    });
    showSnackbar("Import suceed!", "success");
    navigate("/list/1");
  };

  return (
    <Stack aria-label="import-page" flex={1} position="relative" p={2}>
      <Typography variant="h4" mt={2}>
        Importing details
      </Typography>
      <Typography variant="subtitle2" color="GrayText" mt={0.5}>
        By accepting this data will be imported to history.
      </Typography>
      <Stack className="dashed-box" px={3} py={3} gap={1} mt={4}>
        {symptoms.map(({ name, value: v }, i) => (
          <span key={i}>
            <Typography component="span" fontWeight={600}>
              {name}:&nbsp;&nbsp;
            </Typography>
            <Typography component="span" fontWeight={300}>
              {typeof v === "object" ? `from ${v.a} to ${v.b}` : typeof v === "boolean" ? (v ? "Yes" : "No") : v}
            </Typography>
          </span>
        ))}
      </Stack>
      <Box flex={1} />
      <Button variant="contained" color="primary" sx={{ mt: 5, height: 48, fontSize: "1rem" }} onClick={handleImport}>
        Import
      </Button>
    </Stack>
  );
}
