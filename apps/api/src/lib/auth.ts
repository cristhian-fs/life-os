import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { betterAuth } from "better-auth";
import { openAPI, testUtils } from "better-auth/plugins";
import env from "@life-os/env";

import { AppDataSource } from "../db/data-source";

export const auth = betterAuth({
  database: typeormAdapter(AppDataSource),
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: { enabled: true },
  plugins: [
    openAPI({ disableDefaultReference: true }),
    ...(env.NODE_ENV === "test" ? [testUtils()] : []),
  ],
});
