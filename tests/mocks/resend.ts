import { vi } from "vitest";

// Mock de Resend
export const mockResend = {
  emails: {
    send: vi.fn().mockResolvedValue({
      id: "test-email-id",
      from: "noreply@test.com",
      to: "test@test.com",
      created_at: new Date().toISOString(),
    }),
  },
};

// Mock du module resend
vi.mock("resend", () => ({
  Resend: vi.fn(() => mockResend),
}));

export default mockResend;
