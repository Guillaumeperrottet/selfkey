// This file is used to instrument your application with Sentry.
// It's loaded automatically by Next.js when you have experimental.instrumentationHook enabled.
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture errors from nested React Server Components
export async function onRequestError(
  error: Error & { digest?: string },
  request: {
    path: string;
    method: string;
    headers: Headers;
  }
) {
  Sentry.captureException(error, {
    tags: {
      error_boundary: "server_component",
      path: request.path,
      method: request.method,
    },
    contexts: {
      request: {
        path: request.path,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
      },
      errorInfo: {
        digest: error.digest,
      },
    },
  });
}
