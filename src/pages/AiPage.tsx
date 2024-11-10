import { Box, Button, List, ListItem, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";
import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IAiThinkRef } from "../components/AiThink";
import { forms } from "../data/ai";
import { objectToUrlParams } from "../lib/url";
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
  const aiThink = useRef<IAiThinkRef>(null!);

  const handleSubmit = async (i: number, text: string) => {
    if (loading) return; // TODO error
    const newData = [...data];
    newData[i] = text;
    setData(newData); // cache
    // next form
    if (!final) {
      aiThink.current.nextLoop();
      return nav("/ai/" + (index + 2));
    }
    // final - process
    const message = newData.join("\n");
    // play animation
    setLoading(true);
    // api call
    const res = await axios.post("https://orda-api.dr-cad.ir/assistant", { message });
    console.log(message, res.data);
    setLoading(false);
    if (!res.data) return; // TODO error
    nav("/import?" + objectToUrlParams(res.data));
  };

  return (
    <Stack aria-label="ai-page" flex={1} position="relative" p={2}>
      <Stack mt={2} position="relative" alignItems="center" justifyContent="center">
        <Box width="45%" sx={{ aspectRatio: 1 }}>
          <Suspense>
            <AiThink ref={aiThink} loading={loading} />
          </Suspense>
        </Box>
      </Stack>
      <Box flex="0.25 0 1rem" />
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
}: IAiForm & { loading: boolean; cache: string; buttonTitle: string; handleSubmit: (text: string) => void }) {
  const input = useRef<HTMLInputElement>();
  const [error, setError] = useState(false);
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
      <TextField
        inputRef={input}
        error={error}
        helperText={error ? "Please fill this field!" : "..."}
        onFocus={() => setError(false)}
        defaultValue={cache}
        multiline
        rows={5}
        placeholder={placeholder}
        FormHelperTextProps={{ style: { color: error ? "yellow" : "transparent" } }}
      />
      <Box flex="0 0 1.5rem" />
      <Button
        variant="contained"
        // disabled={loading}
        color={!loading ? "primary" : "secondary"}
        sx={{ height: 44, pointerEvents: !loading ? "auto" : "none" }}
        onClick={() => {
          const text = input.current?.value;
          if (!text) return setError(true);
          handleSubmit(text);
        }}>
        {buttonTitle}
      </Button>
    </Stack>
  );
}
