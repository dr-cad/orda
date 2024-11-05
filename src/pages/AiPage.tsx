import { Box, Button, List, ListItem, Stack, TextField, Typography } from "@mui/material";
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { forms } from "../data/ai";
import { useBufferStore } from "../store";
import { IAiForm } from "../types";

const AiThink = lazy(() => import("../components/AiThink"));

export default function AiPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const index = useMemo(() => (id ? parseInt(id) - 1 : 0), [id]);
  const form = forms[index];
  const final = index === forms.length - 1;
  const data = useBufferStore((s) => s.aiInputs);
  const setData = useBufferStore((s) => s.setAiInputs);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (i: number, text?: string) => {
    if (loading) return; // TODO error
    if (!text) return; // TODO error
    const newData = [...data];
    newData[i] = text;
    setData(newData); // cache
    // next form
    if (!final) {
      return nav("/ai/" + (index + 2));
    }
    // process
    const message = newData.join("\n");
    // play animation
    setLoading(true);
    // api call
    console.log(message);
    setTimeout(() => {
      setLoading(false);
    }, 8000);
    // nav to import page
  };

  return (
    <Stack aria-label="ai-page" flex={1} position="relative" p={2}>
      <Stack mt={2} position="relative" alignItems="center" justifyContent="center">
        <Box width="55%" sx={{ aspectRatio: 1 }}>
          <Suspense>
            <AiThink loading={loading} />
          </Suspense>
        </Box>
        <Typography position="absolute" variant="h5" align="center">
          CAD.AI
        </Typography>
      </Stack>
      <Box flex="0.5 0 auto" />
      <AiForm
        {...form}
        key={index}
        cache={data[index]}
        loading={loading}
        buttonTitle={!final ? "Confirm" : !loading ? "Process" : "Processing..."}
        handleSubmit={(text) => handleSubmit(index, text)}
      />
      <Box flex="1 0 5rem" />
    </Stack>
  );
}

function AiForm({
  title,
  questions,
  placeholder,
  cache,
  loading,
  buttonTitle,
  handleSubmit,
}: IAiForm & { loading: boolean; cache: string; buttonTitle: string; handleSubmit: (text?: string) => void }) {
  const input = useRef<HTMLInputElement>();
  return (
    <Stack p={2}>
      <Typography variant="h5">{title}</Typography>
      <List sx={{ listStyle: "inside" }}>
        {questions.map((s, i) => (
          <ListItem key={i} sx={{ p: 0, display: "list-item", color: "#fff6" }}>
            {s}
          </ListItem>
        ))}
      </List>
      <Box flex="0 0 1rem" />
      <TextField inputRef={input} defaultValue={cache} multiline rows={8} placeholder={placeholder} />
      <Box flex="0 0 1.5rem" />
      <Button
        variant="contained"
        color={!loading ? "primary" : "secondary"}
        disabled={loading}
        sx={{ height: 44 }}
        onClick={() => handleSubmit(input.current?.value)}>
        {buttonTitle}
      </Button>
    </Stack>
  );
}
