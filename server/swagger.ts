import type { ObjectSubtype, OpenAPI3 } from "openapi-typescript/dist/types.d.ts";
import symptoms from "../src/data/symptoms";
import { SymptomType } from "../src/types";

const properties: ObjectSubtype["properties"] = {};

symptoms.forEach((s) => {
  if (s.gpt === false || s.options) return;
  const sid = s.id.replace(/-/g, "_"); // make it readable for gpt
  properties[sid] = {
    title: s.name,
    description: s.details,
    type: (s.type === SymptomType.String
      ? "string"
      : s.type === SymptomType.Number
      ? "integer"
      : s.type === SymptomType.Range
      ? "object"
      : "boolean") as any,
    format: s.type === SymptomType.Number ? "int32" : undefined,
    properties:
      s.type === SymptomType.Range
        ? {
            a: { type: "integer", title: "from", description: "From: Starting point number of the specific region" },
            b: { type: "integer", title: "to", description: "To: Finishing point number of the specific region" },
          }
        : undefined,
    minimum: s.min,
    maximum: s.max,
  };
});

// const required = symptoms.filter((s) => s.required).map((s) => s.id);

const swagger: OpenAPI3 = {
  openapi: "3.1.0",
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
                // Alexis: {
                //   $ref: "#/components/examples/Alex",
                // },
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
                examples: {
                  "Dentigerous Cyst": {
                    $ref: "#/components/examples/Dentigerous Cyst",
                  },
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
      // requestBodies
      // Alexis: {
      //   summary: "Example of a symptoms report mapped to symptoms values by their id",
      //   description:
      //     "A 32-year old female, with no systematic disease or pain, was incidentally diagnosed with a lesion in the left mandible about two month ago after taking a radiograph. On the panoramic image, A well-defined corticated radiolucent lesion is observed on the left side of the mandible, associated with the peri coronal region of third molar. The lesion shows bone extension but has not caused any bony expansion.",
      //   value: {
      //     pat_age: 32,
      //     pat_female: true,
      //     moderate_0: true,
      //     corticated: true,
      //     mandible: { a: 4, b: 5 },
      //     unilateral_left: true,
      //     pericoronal: true,
      //     extend: true,
      //     uni1: true,
      //   },
      // },
      // responses
      "Dentigerous Cyst": {
        summary: "", // TODO
        description: "", // TODO
        value: {
          scores: [
            {
              id: "dentigerous",
              name: "Dentigerous Cyst",
              probablity: 75,
            },
            {
              id: "myxoma",
              name: "Odontogenic Myxoma",
              probablity: 11,
            },
            {
              id: "okc",
              name: "Odontogenic keratocyst",
              probablity: 7,
            },
            {
              id: "unicystic",
              name: "Unicystic/Mural Ameloblastoma",
              probablity: 4,
            },
            {
              id: "abscess",
              name: "Periapical Abscess",
              probablity: 2,
            },
          ],
        },
      },
    },
  },
};

export default swagger;
