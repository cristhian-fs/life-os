import { serve } from "@hono/node-server";
import "reflect-metadata";

import app from "./app";
import { AppDataSource } from "@/db/data-source";
import env from "@life-os/env";

async function connectWithRetry(
  maxRetries = 10,
  delayMs = 3000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await AppDataSource.initialize();
      console.log("Conectado ao banco de dados com sucesso");
      return;
    } catch (err) {
      console.error(
        `Tentativa ${attempt}/${maxRetries} de conectar ao banco falhou:`,
        err instanceof Error ? err.message : err,
      );
      if (attempt === maxRetries) {
        throw new Error(
          "Não foi possível conectar ao banco após várias tentativas",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

await connectWithRetry();

const port = env.PORT;
console.log(`Server is running on port http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
