import { Box, Button, List, ListItem, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { forms } from "../data/ai";
import { useBufferStore } from "../store";
import { IAiForm } from "../types";

export default function AiPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const index = useMemo(() => (id ? parseInt(id) - 1 : 0), [id]);
  const form = forms[index];
  const final = index === forms.length - 1;
  const data = useBufferStore((s) => s.aiInputs);
  const setData = useBufferStore((s) => s.setAiInputs);

  const handleSubmit = (i: number, text?: string) => {
    if (!text) return; // TODO error
    const newData = [...data];
    newData[i] = text;
    setData(newData); // cache
    // next form
    if (!final) {
      return nav("/ai/" + (index + 2));
    }
    // process - api call to chatgpt
    // TODO
    // TODO play animation
    // TODO nav to import page
    console.log(newData);
  };

  return (
    <Stack aria-label="ai-page" flex={1} position="relative" p={2}>
      <Typography mt={2} variant="h3" align="center" color="primary.main">
        AI.
      </Typography>
      <Box flex="1 0 3rem" />
      <AiForm
        key={index}
        cache={data[index]}
        {...form}
        final={final}
        handleSubmit={(text) => handleSubmit(index, text)}
      />
      <Box flex="1 0 4rem" />
    </Stack>
  );
}

function AiForm({
  title,
  questions,
  placeholder,
  cache,
  final,
  handleSubmit,
}: IAiForm & { cache: string; final: boolean; handleSubmit: (text?: string) => void }) {
  const input = useRef<HTMLInputElement>();
  return (
    <Stack p={2}>
      <Typography variant="h5">{title}</Typography>
      <Box flex="0 0 0.5rem" />
      <List sx={{ listStyle: "inside" }}>
        {questions.map((s, i) => (
          <ListItem key={i} sx={{ p: 0, display: "list-item", color: "#fff6" }}>
            {s}
          </ListItem>
        ))}
      </List>
      <Box flex="0 0 2rem" />
      <TextField inputRef={input} defaultValue={cache} multiline rows={8} placeholder={placeholder} />
      <Box flex="0 0 1.5rem" />
      <Button variant="contained" sx={{ height: 44 }} onClick={() => handleSubmit(input.current?.value)}>
        {!final ? "Confirm" : "Process"}
      </Button>
    </Stack>
  );
}
