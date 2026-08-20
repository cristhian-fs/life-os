import env from "@life-os/env";
import { cors } from "hono/cors";

export default cors({
  origin: env.CORS_ORIGIN,
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
