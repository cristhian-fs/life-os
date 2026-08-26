/* eslint-disable node/no-process-env */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

// Resolve relative to this package's own location (repo root/packages/env),
// not process.cwd() — pnpm/turbo run scripts with cwd set to whichever app
// invoked them, but .env lives at the monorepo root.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

expand(
	config({
		path: path.resolve(
			repoRoot,
			process.env.NODE_ENV === "test" ? ".env.test" : ".env",
		),
	}),
);

export const EnvSchema = z.object({
	NODE_ENV: z.string().default("development"),
	PORT: z.coerce.number().default(9999),
	LOG_LEVEL: z.enum([
		"fatal",
		"error",
		"warn",
		"info",
		"debug",
		"trace",
		"silent",
	]),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),
	CORS_ORIGIN: z.url().optional().default("http://localhost:3000"),
	DATABASE_URL: z.string(),
	VITE_API_URL: z.string(),
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
	console.error("❌ Invalid env:");
	console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
	process.exit(1);
}

export default env!;
