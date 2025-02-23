import { openai } from "@ai-sdk/openai";
import { experimental_generateImage, Message, streamText, tool } from "ai";
import { z } from "zod";
import { generateImage } from "./dalle";
import { USE_VERCEL_DALLE } from "@/env";

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  // filter through messages and remove base64 image data to avoid sending to the model
  const formattedMessages = messages.map((m) => {
    if (m.role === "assistant" && m.toolInvocations) {
      m.toolInvocations.forEach((ti) => {
        if (ti.toolName === "generateImage" && ti.state === "result") {
          ti.result.image = `redacted-for-length`;
        }
      });
    }
    return m;
  });

  const result = streamText({
    model: openai("gpt-4o"),
    messages: formattedMessages,
    tools: {
      generateImage: tool({
        description: "Generate an image",
        parameters: z.object({
          prompt: z.string().describe("Make your images black and white"),
        }),
        execute: async ({ prompt }) => {
          if (USE_VERCEL_DALLE) {
            const { image } = await experimental_generateImage({
              model: openai.image("dall-e-3"),
              prompt,
            });

            return { image: image.base64, prompt, url: image.base64 };
          }

          const url = await generateImage({ prompt });
          return { url, prompt };
        },
      }),
    },
    toolCallStreaming: true,
  });

  return result.toDataStreamResponse();
}
