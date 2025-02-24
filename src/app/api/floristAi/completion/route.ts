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
            prompt: z.string().describe("You generate hyper-realistic, high-resolution flower images, including raw photographs, analog-style photos, and 4K Fujifilm-quality images. As an expert floral designer, your images must be clear, detailed, and realistic enough for florists to use as references when creating physical bouquets. You should only generate images of floral arrangements, bouquets, single flowers, or other flower-related designs that a florist would sell. Avoid generating non-flower-related images. Your images should accurately reflect the requested floral styles, colors, and compositions."),
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
