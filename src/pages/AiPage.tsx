import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import gsap from "gsap";
import { TextPlugin } from "gsap/all";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Typed from "typed.js";
import { IAiThinkRef } from "../components/AiThink";
import errors from "../config/errors";
import { forms } from "../data/ai";
import { siteKey } from "../lib/turnstile";
import { objectToUrlParams } from "../lib/url";
import { useBufferStore } from "../store";
import { Fields, IAiForm } from "../types";

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

  const handleSubmit = async (i: number, text?: string) => {
    try {
      setLoading(true);
      if (!text) throw errors.MESSAGE_LEN_SHORT;
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
      if (message.length < 50) {
        throw errors.MESSAGE_LEN_SHORT;
      }
      // play animation
      // api call
      const res = await axios.post<{ symptoms: Fields }>(baseURL + "/assistant", { message, token });
      if (!res.data.symptoms) throw "Information is not enough!";
      nav("/import?" + objectToUrlParams(res.data.symptoms)); // correct
    } catch (e) {
      if (e instanceof AxiosError) {
        const message = e.response?.data?.error || e.response?.data;
        if (message) return setErrorAndResetToken(message);
      }
      if (typeof e === "string") return setErrorAndResetToken(e);
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
        loading={loading}
        buttonTitle={buttonTitle}
        handleSubmit={(text) => handleSubmit(index, text)}
      />
    </Stack>
  );
}

function AiForm({
  content,
  placeholder,
  cache,
  loading,
  preparing,
  error,
  buttonTitle,
  handleSubmit,
}: IAiForm & {
  error: string | undefined;
  loading: boolean;
  preparing: boolean;
  cache: string;
  buttonTitle: string;
  handleSubmit: (text?: string) => void;
}) {
  const input = useRef<HTMLInputElement>();
  const respond = useRef<HTMLSpanElement>(null!);

  useEffect(() => {
    const _err = error ? `<span>${error.split("\n").join("</span><br/><span>")}</span>` : undefined;
    const text = (_err || content)?.replace(/\n/g, "<br/>");
    const typed = new Typed(respond.current, {
      strings: [text],
      typeSpeed: 10,
      backSpeed: 0,
      showCursor: false,
      fadeOut: true,
    });
    return () => {
      typed.destroy();
    };
  }, [content, error]);

  return (
    <Stack p={2} flex={1}>
      <Box flex={{ xs: "0 0 1rem", sm: "0 0 2rem" }} />
      <Typography ref={respond} variant="body1" className="ai-error" />
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
        onClick={() => handleSubmit(input.current?.value)}>
        {buttonTitle}
      </Button>
    </Stack>
  );
}
