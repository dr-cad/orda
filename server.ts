import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import symptoms from "./src/data/symptoms";
import { getDiseases } from "./src/lib/get-diseases";
import { getSymptoms } from "./src/lib/get-symptoms";
import getScores from "./src/lib/scores";
import { digestSymptom, recursivelyResetItem, recursivelyUpdateParents } from "./src/lib/symptoms";
import { ISymptom, SymptomType } from "./src/types";
import { SId } from "./src/types/sid";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json

const properties = {};

symptoms.forEach((s) => {
  if (s.gpt === false || s.options) return;
  properties[s.id] = {
    title: s.name,
    description: s.details,
    type:
      s.type === SymptomType.String
        ? "string"
        : s.type === SymptomType.Number
        ? "integer"
        : s.type === SymptomType.Range
        ? "object"
        : "boolean", // None
    format: s.type === SymptomType.Number ? "int32" : undefined,
    minimum: s.min,
    maximum: s.max,
    properties: s.type === SymptomType.Range ? { a: "integer", b: "integer" } : undefined,
  };
});

// const required = symptoms.filter((s) => s.required).map((s) => s.id);

app.get("/", (_, res) => {
  res.send({
    swagger: "2.0",
    info: {
      title: "Jaw bone lesion detection app",
      summary: "A jaw bone lesion detection program.",
      description: "This is an app that classifies jaw bone lesions.",
      version: "1.0.1",
    },
    servers: [
      {
        url: "https://orda.onrender.com",
        description: "API root endpoint",
      },
    ],
    paths: {
      "/process": {
        post: {
          summary: "Find jaw bone lesions based on patient symptoms",
          description:
            "This endpoint receives symptoms from the patient and returns the list of most relevant jaw bone lesion by percentage",
          operationId: "lesionClassification",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Symptoms",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Lesions list generated!",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Scores",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Symptoms: {
          type: "object",
          properties,
          // required,
        },
        Scores: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
              name: {
                type: "string",
                description: "Name of the disease",
              },
              pvalue: {
                type: "number",
                format: "double",
                description: "Probablity score of the disease",
              },
            },
          },
        },
      },
    },
  });
});

app.post("/process", (req, res) => {
  const symptoms: ISymptom[] = getSymptoms();
  Object.keys(req.body).forEach((k) => {
    const value = req.body[k];
    const id = k.replace(/__/g, "-") as SId;
    const item = symptoms.find((i) => i.id === id);
    if (item) {
      // NOTICE Quick fix: I excluded inputs from reseting - the reason why I did this is that, the input items don't have children.
      const { hasInput } = digestSymptom(item);
      // if unset occured and has options -> reset item -r
      if (!value && !hasInput) recursivelyResetItem(symptoms, item.id, true);
      // update/reset value
      item.value = value;
      recursivelyUpdateParents(symptoms, item.id, true);
    } else {
      console.error("Couldnt find item", id);
    }
  });
  const scores = getScores({ diseases: getDiseases(), symptoms, silent: true })
    .sort((a, b) => b.pvalue - a.pvalue)
    .slice(0, 5)
    .map(({ id, name, pvalue }) => ({ id, name, pvalue }));
  console.log(JSON.stringify(req.body));
  console.log(scores.map(({ name, pvalue }) => ({ name, pvalue })));
  res.send({ scores });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
