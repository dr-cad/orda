import type { OpenAPI3 } from "openapi-typescript/dist/types.d.ts";
import symptoms from "../src/data/symptoms";
import { SymptomType } from "../src/types";

const properties = {};
symptoms.forEach((s) => {
  if (s.gpt === false || s.options) return;
  const sid = s.id.replace(/-/g, "_"); // make it readable for gpt
  properties[sid] = {
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
    properties: s.type === SymptomType.Range ? { a: "integer", b: "integer" } : undefined,
    minimum: s.min,
    maximum: s.max,
  };
});

// const required = symptoms.filter((s) => s.required).map((s) => s.id);

const swagger: OpenAPI3 = {
  openapi: "3.0.0",
  info: {
    title: "Jaw bone lesion detection app",
    summary: "A jaw bone lesion detection program.",
    description: "This is an app that classifies jaw bone lesions.",
    version: "1.0.2",
  },
  servers: [
    {
      url: "https://orda.onrender.com",
      description: "API root endpoint",
      variables: {},
    },
    // {
    //   url: "http://localhost:3000",
    //   description: "API root endpoint for development",
    //   variables: {},
    // },
  ],
  paths: {
    "/process": {
      post: {
        summary: "Find jaw bone lesions based on patient symptoms",
        description:
          "This endpoint receives symptoms from the patient and returns the list of most relevant jaw bone lesion by percentage",
        operationId: "lesionClassification",
        requestBody: {
          summary: "Symptoms and their values",
          description: "Request body contains the value for each symptom given by the user",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Symptoms",
              },
              examples: {
                Alex: {
                  $ref: "#/components/examples/Alex",
                },
              },
            },
          },
        },
        responses: {
          "200": {
            summary: "List of lesions",
            description: "Lesions list generated!",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Scores",
                },
                examples: {}, // TODO
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
              description: "Name of the lesion",
            },
            probablity: {
              type: "integer",
              format: "int32",
              description: "Probablity score of the lesion",
            },
          },
        },
      },
    },
    examples: {
      Alex: {
        summary: "",
        description: "",
        value: {
          pat_age: 35,
          bleeding: true,
        },
      },
    },
  },
};

export default swagger;
