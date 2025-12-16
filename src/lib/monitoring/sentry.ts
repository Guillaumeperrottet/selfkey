/**
 * Sentry Monitoring Helpers
 *
 * Fonctions utilitaires pour capturer des erreurs spécifiques avec contexte enrichi
 */

import * as Sentry from "@sentry/nextjs";

// Types pour le contexte
export interface UserContext {
  id: string;
  email: string;
  name?: string;
}

export interface EstablishmentContext {
  slug: string;
  name: string;
  id?: string;
}

export interface BookingContext {
  id: string;
  bookingNumber?: number;
  amount?: number;
  currency?: string;
  type?: string;
}

export interface PaymentContext {
  paymentIntentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Configure le contexte utilisateur dans Sentry
 */
export function setUserContext(user: UserContext | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Ajoute des tags pour faciliter le filtrage dans Sentry
 */
export function setEstablishmentContext(establishment: EstablishmentContext) {
  Sentry.setTag("establishment_slug", establishment.slug);
  Sentry.setTag("establishment_name", establishment.name);
  if (establishment.id) {
    Sentry.setTag("establishment_id", establishment.id);
  }
}

/**
 * Capture une erreur générique avec contexte
 */
export function captureError(
  error: Error | unknown,
  context?: {
    user?: UserContext;
    establishment?: EstablishmentContext;
    extra?: Record<string, unknown>;
  }
) {
  Sentry.withScope((scope) => {
    // Ajouter le contexte utilisateur
    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        username: context.user.name,
      });
    }

    // Ajouter les tags d'établissement
    if (context?.establishment) {
      scope.setTag("establishment_slug", context.establishment.slug);
      scope.setTag("establishment_name", context.establishment.name);
    }

    // Ajouter des données supplémentaires
    if (context?.extra) {
      scope.setContext("additional_data", context.extra);
    }

    // Capturer l'erreur
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(String(error)));
    }
  });
}

/**
 * Capture une erreur de réservation
 */
export function captureBookingError(
  error: Error | unknown,
  booking: BookingContext,
  context?: {
    user?: UserContext;
    establishment?: EstablishmentContext;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "booking");
    scope.setTag("booking_id", booking.id);

    if (booking.bookingNumber) {
      scope.setTag("booking_number", booking.bookingNumber.toString());
    }

    if (booking.type) {
      scope.setTag("booking_type", booking.type);
    }

    scope.setContext("booking", {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      amount: booking.amount,
      currency: booking.currency,
      type: booking.type,
    });

    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        username: context.user.name,
      });
    }

    if (context?.establishment) {
      scope.setTag("establishment_slug", context.establishment.slug);
      scope.setTag("establishment_name", context.establishment.name);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(`Booking error: ${String(error)}`));
    }
  });
}

/**
 * Capture une erreur de paiement Stripe
 */
export function capturePaymentError(
  error: Error | unknown,
  payment: PaymentContext,
  context?: {
    user?: UserContext;
    establishment?: EstablishmentContext;
    booking?: BookingContext;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "payment");
    scope.setTag("payment_provider", "stripe");

    if (payment.paymentIntentId) {
      scope.setTag("payment_intent_id", payment.paymentIntentId);
    }

    if (payment.status) {
      scope.setTag("payment_status", payment.status);
    }

    if (payment.errorCode) {
      scope.setTag("payment_error_code", payment.errorCode);
    }

    scope.setContext("payment", {
      paymentIntentId: payment.paymentIntentId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      errorCode: payment.errorCode,
      errorMessage: payment.errorMessage,
    });

    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        username: context.user.name,
      });
    }

    if (context?.establishment) {
      scope.setTag("establishment_slug", context.establishment.slug);
      scope.setTag("establishment_name", context.establishment.name);
    }

    if (context?.booking) {
      scope.setTag("booking_id", context.booking.id);
      scope.setContext("booking", {
        id: context.booking.id,
        bookingNumber: context.booking.bookingNumber,
        amount: context.booking.amount,
        currency: context.booking.currency,
        type: context.booking.type,
      });
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(`Payment error: ${String(error)}`));
    }
  });
}

/**
 * Capture une erreur d'API
 */
export function captureApiError(
  error: Error | unknown,
  apiContext: {
    endpoint: string;
    method: string;
    statusCode?: number;
    requestBody?: unknown;
    responseBody?: unknown;
  },
  context?: {
    user?: UserContext;
    establishment?: EstablishmentContext;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "api");
    scope.setTag("api_endpoint", apiContext.endpoint);
    scope.setTag("api_method", apiContext.method);

    if (apiContext.statusCode) {
      scope.setTag("status_code", apiContext.statusCode.toString());
    }

    scope.setContext("api_request", {
      endpoint: apiContext.endpoint,
      method: apiContext.method,
      statusCode: apiContext.statusCode,
      requestBody: apiContext.requestBody,
      responseBody: apiContext.responseBody,
    });

    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        username: context.user.name,
      });
    }

    if (context?.establishment) {
      scope.setTag("establishment_slug", context.establishment.slug);
      scope.setTag("establishment_name", context.establishment.name);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(`API error: ${String(error)}`));
    }
  });
}

/**
 * Capture une erreur d'email
 */
export function captureEmailError(
  error: Error | unknown,
  emailContext: {
    to: string;
    subject?: string;
    type?: string;
  },
  context?: {
    user?: UserContext;
    establishment?: EstablishmentContext;
    booking?: BookingContext;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "email");
    scope.setTag("email_to", emailContext.to);

    if (emailContext.type) {
      scope.setTag("email_type", emailContext.type);
    }

    scope.setContext("email", {
      to: emailContext.to,
      subject: emailContext.subject,
      type: emailContext.type,
    });

    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        username: context.user.name,
      });
    }

    if (context?.establishment) {
      scope.setTag("establishment_slug", context.establishment.slug);
      scope.setTag("establishment_name", context.establishment.name);
    }

    if (context?.booking) {
      scope.setTag("booking_id", context.booking.id);
      scope.setContext("booking", {
        id: context.booking.id,
        bookingNumber: context.booking.bookingNumber,
        amount: context.booking.amount,
        currency: context.booking.currency,
        type: context.booking.type,
      });
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(`Email error: ${String(error)}`));
    }
  });
}

/**
 * Capture une erreur Prisma/Database
 */
export function captureDatabaseError(
  error: Error | unknown,
  dbContext: {
    operation: string;
    model?: string;
    query?: string;
  },
  context?: {
    user?: UserContext;
    establishment?: EstablishmentContext;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "database");
    scope.setTag("db_operation", dbContext.operation);

    if (dbContext.model) {
      scope.setTag("db_model", dbContext.model);
    }

    scope.setContext("database", {
      operation: dbContext.operation,
      model: dbContext.model,
      query: dbContext.query,
    });

    if (context?.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        username: context.user.name,
      });
    }

    if (context?.establishment) {
      scope.setTag("establishment_slug", context.establishment.slug);
      scope.setTag("establishment_name", context.establishment.name);
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error(`Database error: ${String(error)}`));
    }
  });
}

/**
 * Ajoute un breadcrumb pour tracer le parcours utilisateur
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: "fatal" | "error" | "warning" | "log" | "info" | "debug" = "info"
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture un message (pas une erreur)
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "log" | "info" | "debug" = "info"
) {
  Sentry.captureMessage(message, level);
}

/**
 * Wrapper pour les fonctions async qui capture automatiquement les erreurs
 */
export async function withSentry<T>(
  fn: () => Promise<T>,
  errorContext?: {
    name: string;
    user?: UserContext;
    establishment?: EstablishmentContext;
    extra?: Record<string, unknown>;
  }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    captureError(error, {
      user: errorContext?.user,
      establishment: errorContext?.establishment,
      extra: {
        functionName: errorContext?.name,
        ...errorContext?.extra,
      },
    });
    throw error;
  }
}
