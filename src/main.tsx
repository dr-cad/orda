import { CssBaseline, ThemeProvider } from "@mui/material";
import * as Sentry from "@sentry/react";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Snackbar from "./components/Snackbar";
import theme from "./config/theme";
import "./index.css";

Sentry.init({
  dsn: "https://af24e103ad7e7acf9b444ed9da19afe5@o4507758932459520.ingest.de.sentry.io/4507758947205200",
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  enabled: import.meta.env.PROD,
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Snackbar />
    </ThemeProvider>
    <Analytics />
  </React.StrictMode>
);
