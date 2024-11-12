import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Box, Button, List, ListItem, Stack, TextField, Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import gsap from "gsap";
import { TextPlugin } from "gsap/all";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IAiThinkRef } from "../components/AiThink";
import { forms } from "../data/ai";
import { siteKey } from "../lib/turnstile";
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
  const [token, setToken] = useState<string>();
  const turnstile = useRef<TurnstileInstance>(null!);

  const setErrorAndResetToken = (message: string) => {
    setToken(undefined);
    setError(message);
    turnstile.current.reset();
  };

  const handleSubmit = async (i: number, text: string) => {
    if (loading || !token) return;
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
      const res = await axios.post(baseURL + "/assistant", { message, token });
      if (!res.data.symptoms) return setErrorAndResetToken("Information is not enough!");
      if (typeof res.data.symptoms === "string") return setErrorAndResetToken(res.data.symptoms);
      nav("/import?" + objectToUrlParams(res.data.symptoms)); // correct
    } catch (e) {
      if (e instanceof AxiosError) {
        const message = e.response?.data?.error;
        if (message) return setErrorAndResetToken(message);
      }
      setErrorAndResetToken("Something went wrong! Please try again..");
    } finally {
      setLoading(false);
    }
  };

  const preparing = !token;
  const buttonTitle = loading ? "Thinking..." : preparing ? "Preparing..." : !final ? "Confirm" : "Proceed";

  return (
    <Stack aria-label="ai-page" flex={1} position="relative" p={2}>
      <Stack mt={2} position="relative" alignItems="center" justifyContent="center">
        <Box width={{ xs: "35%", sm: "45%" }} sx={{ aspectRatio: 1, mt: -12, zIndex: 99 }}>
          <Suspense>
            <AiThink ref={aiThink} loading={loading} error={!!error} />
          </Suspense>
        </Box>
      </Stack>
      <Turnstile
        ref={turnstile}
        siteKey={siteKey}
        options={{
          appearance: "interaction-only",
          refreshExpired: "auto",
          theme: "dark",
        }}
        onSuccess={(token) => setToken(token)}
        onExpire={() => setToken(undefined)}
        className="turnstile-round"
      />
      <AiForm
        {...form}
        key={index}
        cache={data[index]}
        error={error}
        preparing={preparing}
        setError={setError}
        loading={loading}
        buttonTitle={buttonTitle}
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
  preparing,
  error,
  setError,
  buttonTitle,
  handleSubmit,
}: IAiForm & {
  error: string | undefined;
  setError: React.Dispatch<React.SetStateAction<string | undefined>>;
  loading: boolean;
  preparing: boolean;
  cache: string;
  buttonTitle: string;
  handleSubmit: (text: string) => void;
}) {
  const input = useRef<HTMLInputElement>();
  const text = useRef<HTMLSpanElement>(null!);
  const list = useRef<HTMLUListElement>(null!);
  const respond = useRef<HTMLSpanElement>(null!);

  const prepare = useCallback(async () => {
    // prepare
    // title
    gsap.killTweensOf(text.current);
    gsap.set(text.current, { text: "", opacity: 0 });
    // list
    const q = gsap.utils.selector(list.current);
    const items = q(".list-item");
    gsap.killTweensOf(items);
    gsap.set(items, { display: "none", opacity: 0 });
    // respond
    gsap.killTweensOf(respond.current);
    gsap.set(respond.current, { text: "", opacity: 0 });
    return { items };
  }, []);

  const animate = useCallback(async () => {
    const { items } = await prepare();
    if (!error) {
      gsap.to(text.current, { opacity: 1, delay: 0.5, duration: 1 });
      await gsap.to(text.current, {
        text: title,
        delay: 0.5,
        duration: title.length / 80,
        ease: "none",
      });
      gsap.to(items, { display: "list-item", opacity: 1, stagger: 1, ease: "none" });
      await gsap.from(items, { duration: 1, stagger: 1, ease: "none" });
    } else {
      gsap.to(respond.current, { opacity: 1, delay: 0.5, duration: 1 });
      await gsap.to(respond.current, {
        text: error,
        delay: 0.5,
        duration: error.length / 80,
        ease: "none",
      });
    }
  }, [error, prepare, title]);

  useEffect(() => {
    animate();
  }, [animate]);

  return (
    <Stack p={2} flex={1}>
      <Box flex={{ xs: "0 0 1rem", sm: "0 0 2rem" }} />
      <Typography ref={text} variant="h5" />
      <List ref={list} sx={{ listStyle: "inside" }}>
        {questions.map((s, i) => (
          <ListItem className="list-item" key={i} sx={{ p: 0, display: "list-item", color: "#fff6" }}>
            {s}
          </ListItem>
        ))}
      </List>
      <Typography ref={respond} variant="body1" sx={{ color: "#fff6" }} />
      <Box flex="1 0 1rem" />
      <TextField
        inputRef={input}
        defaultValue={cache}
        multiline
        rows={7}
        sx={{ py: 1, px: 2.5 }}
        placeholder={placeholder}
      />
      <Box flex={{ xs: "0 0 1rem", sm: "0 0 2rem" }} />
      <Button
        variant="contained"
        disabled={loading || preparing}
        color={!loading ? "primary" : "secondary"}
        sx={{ height: 44, pointerEvents: !loading ? "auto" : "none" }}
        onClick={() => {
          const text = input.current?.value;
          if (!text) return setError("Please fill the field below!");
          handleSubmit(text);
        }}>
        {buttonTitle}
      </Button>
    </Stack>
  );
}
