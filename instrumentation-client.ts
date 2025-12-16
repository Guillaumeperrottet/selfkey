// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Export the router transition hook to instrument navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // This is running on the server, skip client initialization
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Ignore common errors that aren't actionable
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",
      // Random network errors
      "NetworkError",
      "Network request failed",
      "Failed to fetch",
      // Cancelled requests (user navigated away)
      "AbortError",
      "The user aborted a request",
      // CORS errors (often from browser extensions)
      "CORS",
      // Webkit internal errors
      "Non-Error promise rejection captured",
    ],

    beforeSend(event, hint) {
      // Filter out errors from bot user agents
      const userAgent = event.request?.headers?.["User-Agent"];
      if (userAgent && /bot|crawler|spider|crawling/i.test(userAgent)) {
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
}
