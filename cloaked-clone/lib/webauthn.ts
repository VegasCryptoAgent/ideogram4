// ============================================================
// Shielded Privacy App — WebAuthn / FIDO2 relying-party config
// Derives the RP ID (domain) and origin from NEXT_PUBLIC_APP_URL
// so registration works in dev (localhost) and prod identically.
// ============================================================

export const RP_NAME = 'Shield';

export function getRpConfig(): { rpName: string; rpID: string; origin: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const url = new URL(appUrl);
  return {
    rpName: RP_NAME,
    rpID: url.hostname, // domain only, no protocol/port
    origin: url.origin,
  };
}
