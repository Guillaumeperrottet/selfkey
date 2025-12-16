// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Environment
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [Sentry.prismaIntegration()],

  // Ignore common non-critical errors
  ignoreErrors: [
    // Bot requests
    "ECONNREFUSED",
    "ENOTFOUND",
    // Prisma connection issues (temporary)
    "P1001",
    "P1002",
  ],

  beforeSend(event, hint) {
    // Filter out errors from health checks
    const url = event.request?.url;
    if (url && (url.includes("/health") || url.includes("/favicon.ico"))) {
      return null;
    }

    // Don't send errors from localhost in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Sentry would capture:",
        hint.originalException || hint.syntheticException
      );
      return null; // Don't send to Sentry in dev
    }

    return event;
  },
});
