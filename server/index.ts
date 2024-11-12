import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { getDiseases } from "../src/lib/get-diseases";
import { getSymptoms } from "../src/lib/get-symptoms";
import getScores from "../src/lib/scores";
import { updateSymptom } from "../src/lib/symptoms";
import { sidUnderToHyphen } from "../src/lib/url";
import { ISymptom } from "../src/types";
import { extractSymptoms } from "./gpt";
import { apiRules, privacy } from "./strings";
import swagger from "./swagger";
import turnstileVerify from "./turnstile";

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  handler: (req, res, next, options) =>
    res.status(options.statusCode).send({ error: `You can only make ${options.limit} requests every hour` }),
});

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json

app.use(
  "/api",
  swaggerUi.serve,
  swaggerUi.setup(swagger, {
    customSiteTitle: "ORDA API",
  })
);

app.get("/", (_, res) => {
  res.redirect("/api");
});

app.get("/healthz", (_, res) => {
  res.send("We are live!");
});

app.get("/privacy", (_, res) => {
  res.send(privacy);
});

app.get("/rules", (_, res) => {
  res.send(apiRules);
});

app.get("/v3/swagger.json", (_, res) => {
  res.send(swagger);
});

app.post("/process", (req, res) => {
  const symptoms: ISymptom[] = getSymptoms(); // raw data
  Object.keys(req.body).forEach((k) => {
    const value = req.body[k];
    const id = sidUnderToHyphen(k);
    updateSymptom(symptoms, id, value, true);
  });
  const scores = getScores({ diseases: getDiseases(), symptoms, silent: true })
    .sort((a, b) => b.pvalue - a.pvalue)
    .slice(0, 3)
    .map(({ id, name, pvalue }) => ({ id, name, probablity: Math.round(pvalue * 100) }));
  console.log("Body:", JSON.stringify(req.body));
  console.log(scores.map(({ name, probablity }) => ({ name, probablity })));
  res.send({ scores });
});

app.post("/assistant", limiter, async (req, res) => {
  const message = req.body.message;
  if (!message) {
    res.status(400).send({ error: "No message!" });
    return;
  }
  const success = await turnstileVerify(req);
  if (!success) {
    res.status(401).send({ error: "Invalid token!" });
    return;
  }
  const symptoms = await extractSymptoms(message);
  res.send({ symptoms });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
