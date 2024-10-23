import bodyParser from "body-parser";
import express from "express";
import symptoms from "./src/data/symptoms";
import { getDiseases } from "./src/lib/get-diseases";
import getScores from "./src/lib/scores";
import { ISymptom, SymptomType } from "./src/types";
import { SId } from "./src/types/sid";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // for parsing application/json

const properties = {};

symptoms.forEach((s) => {
  if (s.type === SymptomType.Enum) return;
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

const required = symptoms.filter((s) => s.required).map((s) => s.id);

app.get("/", (_, res) => {
  res.send({
    info: {
      title: "Sample Pet Store App",
      summary: "A pet store manager.",
      description: "This is a sample server for a pet store.",
      version: "1.0.1",
    },
    paths: {
      "/process": {
        post: {
          description: "",
          summary: "",
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
              description: "Diseases list generated!",
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
          required,
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
              value: {
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
  const symptoms: ISymptom[] = [];
  Object.keys(req.body).forEach((k) => {
    const id = k as SId;
    const value = req.body[id];
    switch (typeof value) {
      case "boolean":
        symptoms.push({ id, value, type: SymptomType.None, name: id });
        break;
      case "string":
        symptoms.push({ id, value, type: SymptomType.String, name: id });
        break;
      case "number":
        symptoms.push({ id, value, type: SymptomType.Number, name: id });
        break;
      case "object":
        if (typeof value.a !== "number" || typeof value.b !== "number") break; // TODO input error
        symptoms.push({ id, value, type: SymptomType.Range, name: id });
        break;
    }
  });
  const scores = getScores({ diseases: getDiseases(), symptoms });
  console.log(req.body, scores);
  res.send({ scores });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
