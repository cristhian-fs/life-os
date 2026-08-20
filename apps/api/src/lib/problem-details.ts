import type { Context } from "hono";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

export enum ProblemCode {
  NOT_FOUND = "not_found",
  VALIDATION_FAILED = "validation_failed",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  RATE_LIMITED = "rate_limited",
  AI_RUN_FAILED = "ai_run_failed",
  SYNC_FAILED = "sync_failed",
  COST_LIMIT_EXCEEDED = "cost_limit_exceeded",
  INTERNAL_ERROR = "internal_error",
}

const STATUS_PHRASES: Record<number, string> = {
  400: HttpStatusPhrases.BAD_REQUEST,
  401: HttpStatusPhrases.UNAUTHORIZED,
  403: HttpStatusPhrases.FORBIDDEN,
  404: HttpStatusPhrases.NOT_FOUND,
  405: HttpStatusPhrases.METHOD_NOT_ALLOWED,
  409: HttpStatusPhrases.CONFLICT,
  422: HttpStatusPhrases.UNPROCESSABLE_ENTITY,
  429: HttpStatusPhrases.TOO_MANY_REQUESTS,
  500: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
  503: HttpStatusPhrases.SERVICE_UNAVAILABLE,
};

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: ProblemCode;
  [key: string]: unknown;
}

export function problem(
  c: Context,
  status: number,
  options: {
    detail?: string;
    code?: ProblemCode;
    extensions?: Record<string, unknown>;
  } = {},
): Response {
  const body: ProblemDetails = {
    type: "about:blank",
    title: STATUS_PHRASES[status] ?? "Unknown Error",
    status,
    instance: c.req.path,
    ...(options.detail !== undefined && { detail: options.detail }),
    ...(options.code !== undefined && { code: options.code }),
    ...options.extensions,
  };

  return c.json(body, status as never, {
    "Content-Type": "application/problem+json",
  });
}
