import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { getDiseases } from "../src/lib/get-diseases";
import { getSymptoms } from "../src/lib/get-symptoms";
import getScores from "../src/lib/scores";
import { updateSymptom } from "../src/lib/symptoms";
import { ISymptom } from "../src/types";
import { SId } from "../src/types/sid";
import { privacy } from "./strings";
import swagger from "./swagger";

const app = express();
const port = process.env.PORT || 3000;

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

app.get("/privacy", (_, res) => {
  res.send(privacy);
});

app.get("/v2/swagger.json", (_, res) => {
  res.send(swagger);
});

app.post("/process", (req, res) => {
  const symptoms: ISymptom[] = getSymptoms(); // raw data
  Object.keys(req.body).forEach((k) => {
    const value = req.body[k];
    const id = k.replace(/__/g, "-").replace(/_/g, "-") as SId;
    updateSymptom(symptoms, id, value, true);
  });
  const scores = getScores({ diseases: getDiseases(), symptoms, silent: true })
    .sort((a, b) => b.pvalue - a.pvalue)
    .slice(0, 5)
    .filter((s, i) => i < 3 || s.pvalue > 0.01)
    .map(({ id, name, pvalue }) => ({ id, name, probablity: Math.round(pvalue * 100) }));
  console.log("Body:", JSON.stringify(req.body));
  console.log(scores.map(({ name, probablity }) => ({ name, probablity })));
  res.send({ scores });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
