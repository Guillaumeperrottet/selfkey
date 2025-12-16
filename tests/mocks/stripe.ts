import { vi } from "vitest";

// Mock de Stripe
export const mockStripe = {
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
    confirm: vi.fn(),
  },
  charges: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  accounts: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

// Mock du module stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn(() => mockStripe),
  };
});

export default mockStripe;
