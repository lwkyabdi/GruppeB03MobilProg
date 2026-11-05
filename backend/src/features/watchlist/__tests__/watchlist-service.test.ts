import { beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { relations } from "@/db/relations";
import { user } from "@/db/schema";
import type { Result } from "@/lib/result";
import { createWatchlistRepository } from "../watchlist-repository";
import {
  createWatchlistService,
  type WatchlistService,
} from "../watchlist-service";

let db: BetterSQLite3Database<typeof relations>;
let service: WatchlistService;

const ALICE = "user-alice";
const BOB = "user-bob";
const matrix = { tmdbId: 603, title: "The Matrix", posterPath: null };

function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(`Forventet ok, fikk ${result.error.code}`);
  return result.data;
}

beforeEach(async () => {
  const sqlite = new Database(":memory:");
  db = drizzle({ client: sqlite, relations });
  migrate(db, { migrationsFolder: "./drizzle/migrations" });
  await db.insert(user).values([
    { id: ALICE, name: "Alice", email: "alice@example.com" },
    { id: BOB, name: "Bob", email: "bob@example.com" },
  ]);
  service = createWatchlistService(createWatchlistRepository(db));
});

describe("watchlistService", () => {
  it("lager en oppføring og viser den igjen", async () => {
    await service.create(ALICE, matrix);

    const list = unwrap(await service.list(ALICE));

    expect(list.map((entry) => entry.title)).toEqual(["The Matrix"]);
  });

  it("lister bare egne oppføringer", async () => {
    await service.create(ALICE, matrix);

    expect(unwrap(await service.list(BOB))).toHaveLength(0);
  });

  it("avviser duplikat (409)", async () => {
    await service.create(ALICE, matrix);

    const result = await service.create(ALICE, matrix);

    expect(result).toMatchObject({ ok: false, error: { code: "CONFLICT" } });
  });

  it("avviser rating utenfor 1-10 (400)", async () => {
    const created = unwrap(await service.create(ALICE, matrix));

    const result = await service.update(ALICE, created.id, { rating: 11 });

    expect(result).toMatchObject({ ok: false, error: { code: "BAD_REQUEST" } });
  });

  it("gir 404 når oppføringen ikke finnes", async () => {
    const result = await service.findById(ALICE, "finnes-ikke");

    expect(result).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
  });

  it("bruker B kan ikke endre bruker A sin oppføring (403)", async () => {
    const created = unwrap(await service.create(ALICE, matrix));

    const result = await service.update(BOB, created.id, { rating: 1 });

    expect(result).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
  });

  it("bruker B kan ikke slette bruker A sin oppføring (403)", async () => {
    const created = unwrap(await service.create(ALICE, matrix));

    const result = await service.remove(BOB, created.id);

    expect(result).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
    expect(unwrap(await service.list(ALICE))).toHaveLength(1);
  });
});
