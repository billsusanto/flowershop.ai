import { openai } from "@ai-sdk/openai";
import { experimental_generateImage, Message, streamText, tool } from "ai";
import { z } from "zod";

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
          prompt: z.string().describe("The prompt to generate the image from"),
        }),
        execute: async ({ prompt }) => {
          const { image } = await experimental_generateImage({
            model: openai.image("dall-e-3"),
            prompt,
          });
          // in production, save this image to blob storage and return a URL
          return { image: image.base64, prompt };
        },
      }),
    },
  });
  return result.toDataStreamResponse();
}
