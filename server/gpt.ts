import dotenv from "dotenv";
import { readFileSync } from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { ISymptom } from "../src/types";
import { properties } from "./swagger";

dotenv.config({ path: [".env.local", ".env"] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

type Run = OpenAI.Beta.Threads.Runs.Run;
type Fields = { [k: string]: ISymptom["value"] };

export async function extractSymptoms(messageContent: string): Promise<Fields | undefined> {
  // create an assistant
  const instructions = readFileSync(__dirname + "/GPTTOOL.md", "utf-8");
  const assistant = await client.beta.assistants.create({
    model: "gpt-4o-mini",
    temperature: 0,
    top_p: 0,
    instructions,
    tools: [
      {
        type: "function",
        function: {
          name: "lesionClassification",
          description:
            "This function receives symptoms from the patient and returns the list of most relevant jaw bone lesion by percentage",
          parameters: {
            type: "object",
            properties,
          },
        },
      },
    ],
  });

  // create thread and add a message
  const thread = await client.beta.threads.create();
  client.beta.threads.messages.create(thread.id, {
    role: "user",
    content: messageContent,
  });

  // initiate a run
  const handleRequiresAction = (run: Run) => {
    // Check if there are tools that require outputs
    if (
      !run.required_action ||
      !run.required_action.submit_tool_outputs ||
      !run.required_action.submit_tool_outputs.tool_calls
    ) {
      return;
    }

    // Loop through each tool in the required action section
    const toolOutputs: string[] = run.required_action.submit_tool_outputs.tool_calls
      .map((tool) => {
        if (tool.function.name === "lesionClassification") {
          console.log("args:", tool.function.arguments);
          return tool.function.arguments;
        }
      })
      .filter((v) => typeof v === "string");

    if (toolOutputs.length > 0) {
      return JSON.parse(toolOutputs[0]);
    }

    console.log("No tool outputs to submit.");
  };

  const handleRunStatus = (run: Run): Fields | undefined => {
    // Check if the run is completed
    if (run.status === "completed") {
      console.log("completed == wrong");
    } else if (run.status === "requires_action") {
      console.log("requires_action == good");
      console.log(run.status);
      return handleRequiresAction(run);
    } else {
      console.error("Run did not complete:", run.last_error);
    }
  };

  // Create and poll run
  try {
    const run = await client.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });
    return handleRunStatus(run);
  } catch (err) {
    console.log(err);
  }
}
