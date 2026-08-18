import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp";
import { z } from "zod";

interface Env {
  AI: Ai;
}

function createServer(env: Env) {
  const server = new McpServer({
    name: "Flux Image Generator",
    version: "1.0.0",
  });

  server.registerTool(
    "generate_image",
    {
      description:
        "Generate an image using the FLUX.1 schnell image generation model. Give a detailed description of the image you want.",
      inputSchema: z.object({
        prompt: z
          .string()
          .min(1)
          .max(2048)
          .describe("Detailed description of the image to generate"),
      }),
    },
    async ({ prompt }) => {
      try {
        const result = await env.AI.run(
          "@cf/black-forest-labs/flux-1-schnell",
          {
            prompt,
          }
        );

        return {
          content: [
            {
              type: "image",
              data: result.image,
              mimeType: "image/jpeg",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Image generation failed: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

const handler = (request: Request, env: Env, ctx: ExecutionContext) => {
  const server = createServer(env);
  const mcpHandler = createMcpHandler(server);
  return mcpHandler(request, env, ctx);
};

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
