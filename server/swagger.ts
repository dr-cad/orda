import type { ObjectSubtype, OpenAPI3 } from "openapi-typescript/dist/types.d.ts";
import symptoms from "../src/data/symptoms";
import { ISymptomRaw, SymptomType } from "../src/types";

const properties: ObjectSubtype["properties"] = {};

const getSId = (sid: string) => sid.replace(/-/g, "_");

function getSiblings(s: ISymptomRaw): [string | undefined, string[] | undefined] {
  // NOTICE: This function only checks enums of same parent at depth of level 1. (improve if needed)
  const parent = symptoms.find((p) => p.options?.includes(s.id));
  if (!parent || parent.type !== SymptomType.Enum || !parent.options) return [parent?.id, undefined];
  return [parent.id, parent.options];
}

function genEnumWarning(s: ISymptomRaw): string {
  const [, siblings] = getSiblings(s);
  if (!siblings) return "";
  return (
    siblings.map((sid) => `'${getSId(sid)}'`).join(", ") +
    " options are in conflict. only one of them can be true, others MUST be false!"
  );
}

const rules: string[] = [];

symptoms.forEach((s) => {
  if (s.gpt === false || s.options) return;
  const sid = getSId(s.id); // make it readable for gpt
  properties[sid] = {
    title: s.title ?? s.name,
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
  const warning = genEnumWarning(s);
  if (warning) rules.push(warning);
});

// const required: SId[] = ["pat-age"];

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
                Alexis: {
                  $ref: "#/components/examples/Alexis",
                },
                Barbara: {
                  $ref: "#/components/examples/Barbara",
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
                examples: {
                  Dentigerous_Cyst: {
                    $ref: "#/components/examples/Dentigerous_Cyst",
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
      Alexis: {
        summary: "Alexix",
        description:
          "A 32-year old female, with no systematic disease or pain, was incidentally diagnosed with a lesion in the left mandible about two month ago after taking a radiograph. On the panoramic image, A well-defined corticated radiolucent lesion is observed on the left side of the mandible, associated with the peri coronal region of third molar. The lesion shows bone extension but has not caused any bony expansion.",
        value: {
          pat_age: 32,
          pat_female: true,
          moderate_0: true,
          corticated: true,
          mandible: { a: 4, b: 5 },
          unilateral_left: true,
          pericoronal: true,
          extend: true,
          uni1: true,
        },
      },
      Barbara: {
        summary: "Barbara",
        description:
          "24 old female with report of swelling or pain which she reported gradually increased in 2years. The lesion was hard on palpation.Panoramic findings illustrates unilateral, solitary, mixed radiolucent and radiopaque non-odontogenic lesion with irregular, ill-defined , and blending border in Rt side of mandible at ramus to incisors region with expansion of cortical bone and loss of lamina dura.",
        value: {
          pat_age: 24,
          pat_female: true,
          swelling: true,
          pain_0: true,
          slow_0: true,
          bony_hard: true,
          mandible: { a: 2, b: 12 },
          unilateral_right: true,
          solitary: true,
          mixed: true,
          irregular: true,
          blending: true,
          related: true,
          expand: true,
          dura: true,
        },
      },
      // responses
      Dentigerous_Cyst: {
        summary: "Dentigerous Cyst",
        description: "Dentigerous Cyst and 2 more lesions detected by the api",
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
          ],
        },
      },
    },
  },
};

export default swagger;

export { rules };
