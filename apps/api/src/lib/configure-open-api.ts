import { Scalar } from "@scalar/hono-api-reference";
import packageJSON from "../../package.json" with { type: "json" };
import { auth } from "./auth";
import type { AppOpenAPI } from "./types";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.get("/doc", async (c) => {
    const document = app.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        version: packageJSON.version,
        title: "LifeOS",
      },
    });

    const authSchema = await auth.api.generateOpenAPISchema();
    const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

    const authPaths = Object.fromEntries(
      Object.entries(authSchema.paths).map(([path, methods]) => {
        const retagged = { ...methods };
        for (const method of HTTP_METHODS) {
          const operation = retagged[method];
          if (operation) retagged[method] = { ...operation, tags: ["Auth"] };
        }
        return [`/api/auth${path}`, retagged];
      }),
    );

    return c.json({
      ...document,
      paths: { ...document.paths, ...authPaths },
      components: {
        ...document.components,
        schemas: {
          ...document.components?.schemas,
          ...authSchema.components?.schemas,
        },
        securitySchemes: {
          ...document.components?.securitySchemes,
          ...authSchema.components?.securitySchemes,
        },
      },
      tags: [
        ...(document.tags ?? []),
        {
          name: "Auth",
          description:
            "better-auth authentication endpoints (sign-in, sign-up, session, etc.)",
        },
      ],
    });
  });

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      theme: "kepler",
      layout: "modern",
      defaultOpenAllTags: true,
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch",
      },
    }),
  );
}
