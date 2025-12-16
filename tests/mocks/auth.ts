import { vi } from "vitest";

/**
 * Helper pour créer un mock de session Better Auth
 */
export function createMockSession(userId: string, email: string) {
  return {
    user: {
      id: userId,
      email,
      name: "Test User",
      emailVerified: true,
    },
    session: {
      id: "test-session-id",
      userId,
      token: "test-token",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    },
  };
}

// Mock du module @/lib/auth
export const mockAuth = {
  api: {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

export default mockAuth;
