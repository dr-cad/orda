import symptoms from "../src/data/symptoms";
import { SymptomType } from "../src/types";

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

const swagger = {
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
};

export default swagger;
