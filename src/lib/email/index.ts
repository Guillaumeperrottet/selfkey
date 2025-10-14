// Barrel export for email module
export * from "./sender";
// Note: client.ts exports conflicting names with sender.ts
// Import explicitly if needed: import { resend } from '@/lib/email/client'
// export * from './client';
export * from "./translations";
export * from "./templates/confirmation";
// Note: templates/fields.ts is empty, no exports
// export * from './templates/fields';
export * from "./templates/unlayer";
