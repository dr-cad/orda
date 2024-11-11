import { Box, Button, List, ListItem, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";
import gsap from "gsap";
import { TextPlugin } from "gsap/all";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IAiThinkRef } from "../components/AiThink";
import { forms } from "../data/ai";
import { objectToUrlParams } from "../lib/url";
import { useBufferStore } from "../store";
import { IAiForm } from "../types";

gsap.registerPlugin(TextPlugin);

const AiThink = lazy(() => import("../components/AiThink"));

const baseURL = import.meta.env.DEV ? "http://localhost:3000" : "https://orda-api.dr-cad.ir";

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
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (i: number, text: string) => {
    if (loading) return;
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
    try {
      const res = await axios.post(baseURL + "/assistant", { message });
      if (!res.data.symptoms) return setError("Information is not enough!");
      if (typeof res.data.symptoms === "string") return setError(res.data.symptoms);
      console.log(res.data.symptoms);
      nav("/import?" + objectToUrlParams(res.data.symptoms));
    } finally {
      setError("Something went wrong!");
      setLoading(false);
    }
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
      <AiForm
        {...form}
        key={index}
        cache={data[index]}
        error={error}
        setError={setError}
        loading={loading}
        buttonTitle={!final ? "Confirm" : !loading ? "Process" : "Processing..."}
        handleSubmit={(text) => handleSubmit(index, text)}
      />
    </Stack>
  );
}

function AiForm({
  title,
  questions,
  placeholder,
  cache,
  loading,
  error,
  setError,
  buttonTitle,
  handleSubmit,
}: IAiForm & {
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  loading: boolean;
  cache: string;
  buttonTitle: string;
  handleSubmit: (text: string) => void;
}) {
  const input = useRef<HTMLInputElement>();
  const text = useRef<HTMLSpanElement>(null!);
  const list = useRef<HTMLUListElement>(null!);

  useEffect(() => {
    const animate = async () => {
      // prepare
      gsap.killTweensOf(text.current);
      gsap.set(text.current, { text: "", opacity: 0 });
      const q = gsap.utils.selector(list.current);
      const items = q(".list-item");
      gsap.killTweensOf(items);
      gsap.set(items, { display: "none", opacity: 0 });
      // animate
      gsap.to(text.current, { opacity: 1, delay: 0.5, duration: 1 });
      await gsap.to(text.current, {
        text: title,
        delay: 0.5,
        duration: 2,
        ease: "none",
      });
      gsap.from(items, { text: "", duration: 1, stagger: 1, ease: "none" });
      await gsap.to(items, { display: "list-item", opacity: 1, stagger: 1, ease: "none" });
    };
    animate();
  }, [title]);

  return (
    <Stack p={2} flex={1}>
      <Box flex="0.5 0 1rem" />
      <Typography ref={text} variant="h5" />
      <List ref={list} sx={{ listStyle: "inside" }}>
        {questions.map((s, i) => (
          <ListItem className="list-item" key={i} sx={{ p: 0, display: "list-item", color: "#fff6" }}>
            {s}
          </ListItem>
        ))}
      </List>
      <Box flex="1 0 1rem" />
      <TextField
        inputRef={input}
        error={!!error}
        helperText={error ?? "..."}
        onFocus={() => setError(undefined)}
        defaultValue={cache}
        multiline
        rows={8}
        placeholder={placeholder}
        FormHelperTextProps={{ style: { color: error ? "yellow" : "transparent" } }}
      />
      <Box flex="0 0 2rem" />
      <Button
        variant="contained"
        disabled={loading}
        color={!loading ? "primary" : "secondary"}
        sx={{ height: 44, pointerEvents: !loading ? "auto" : "none" }}
        onClick={() => {
          const text = input.current?.value;
          if (!text) return setError("Please fill this field!");
          handleSubmit(text);
        }}>
        {buttonTitle}
      </Button>
    </Stack>
  );
}
