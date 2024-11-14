import dotenv from "dotenv";
import { readFileSync } from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { Fields } from "../src/types";
import { properties } from "./swagger";

const required = ["pat_age", "pat_name", "pat_female", "pat_male"];

dotenv.config({ path: [".env.local", ".env"] });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

type Run = OpenAI.Beta.Threads.Runs.Run;

export async function extractSymptoms(messageContent: string): Promise<Fields | string | undefined> {
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
            required,
          },
        },
      },
    ],
  });

  // create thread and add a message
  const thread = await client.beta.threads.create();
  await client.beta.threads.messages.create(thread.id, {
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

    // stop the run - we don't need it anymore
    client.beta.threads.runs.cancel(thread.id, run.id);

    // response
    if (toolOutputs.length > 0) {
      return JSON.parse(toolOutputs[0]);
    }

    console.log("No tool outputs to submit.");
  };

  const handleRunStatus = async (run: Run): Promise<Fields | string | undefined> => {
    // Check if the run is completed
    if (run.status === "completed") {
      console.log("completed == wrong");
      const messages = await client.beta.threads.messages.list(thread.id);
      const text: string = (messages.data.find((m) => m.role === "assistant")?.content[0] as any)?.text?.value;
      return text ?? undefined;
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
    return await handleRunStatus(run);
  } catch (err) {
    console.log(err);
  }
}
