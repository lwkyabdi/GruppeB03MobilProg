/**
 * Erstatter `cloudflare:workers` i Vitest, se `vitest.config.ts`.
 *
 * Tome med vilje: `src/db/index.ts` kan lastes, men en spørring gjennom `db`
 * feiler. Tester som trenger databasen sender inn en better-sqlite3-klient
 */
export const env: Partial<Env> = {};
