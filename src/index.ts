import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
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
        "Generate an image using FLUX.1 schnell. Describe exactly what you want.",
      inputSchema: {
        prompt: z.string().min(1).max(2048),
      },
    },
    async ({ prompt }) => {
      const result = await env.AI.run(
  "@cf/black-forest-labs/flux-1-schnell",
  {
    prompt,
    steps: 4,
  }
);

if (!result.image) {
  return {
    content: [
      {
        type: "text",
        text: "Flux returned no image. Full response: " + JSON.stringify(result),
      },
    ],
    isError: true,
  };
}

      return {
        content: [
          {
            type: "image",
            data: result.image,
            mimeType: "image/jpeg",
          },
        ],
      };
    }
  );

  return server;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return createMcpHandler(() => createServer(env))(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
