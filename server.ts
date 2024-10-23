import bodyParser from "body-parser";
import express from "express";
import symptoms from "./src/data/symptoms";
import { SymptomType } from "./src/types";

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
      },
    },
  });
});

app.post("/process", (req, res) => {
  console.log(req.body);
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
