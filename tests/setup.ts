import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock des variables d'environnement
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.STRIPE_TEST_SECRET_KEY = "sk_test_mock";
process.env.STRIPE_TEST_PUBLISHABLE_KEY = "pk_test_mock";
process.env.RESEND_API_KEY = "re_mock";

// Mock de next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock de next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));
