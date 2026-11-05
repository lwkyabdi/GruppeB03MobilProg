import { and, eq } from "drizzle-orm";
import { type DB, db } from "@/db";
import {
    watchlistEntry,
    type NewWatchlistEntry,
    type UpdateWatchlistEntry,
    type WatchlistEntry,
} from "@/db/schema/";
import { Errors, ResultHandler, executeDbOperation, type Result } from "@/lib/result";
import type { ListWatchlistParams } from "./watchlist-schema";

export type FindManyParams = ListWatchlistParams & { userId: string };

export interface WatchlistRepository {
    create(data: NewWatchlistEntry): Promise<Result<WatchlistEntry>>;
    // null er ingen oppføring med denne id-en.
    findById(id: string): Promise<Result<WatchlistEntry | null>>;
    findByTmdbId(userId: string, tmdbId: number): Promise<Result<WatchlistEntry | null>>;
    findMany(params: FindManyParams): Promise<Result<WatchlistEntry[]>>;
    update(id: string, userid: string, data: UpdateWatchlistEntry): Promise<Result<WatchlistEntry>>;
    remove(id: string, userId: string): Promise<Result<void>>;
}

function isUniqueVioltaion(error: unknown): boolean {
    let current: unknown = error;
    for (let i = 0; i < 3 && current instanceof Error; i++) {
        if (current.message.includes("UNIQUE constraint failed")) return true;
        current = current.cause;
    }
    return false;
}

export function createWatchlistRepository(_db: DB): WatchlistRepository {
    return {
        async create(data) {
            try {
                const entry = await _db.insert(watchlistEntry).values(data).returning().get();
                return ResultHandler.success(entry);
            } catch (error) {
                if (isUniqueVioltaion(error)) {
                    return ResultHandler.failure(
                        "Filmen ligger allerede i watchlisten",
                        Errors.CONFLICT,
                    );
                }
                console.error("Databasekall feilet:", error);
                return ResultHandler.failure("Noe gikk galt i databasen");
            }
        },

        findById(id) {
            return executeDbOperation(
                async () =>
                (await _db.select().from(watchlistEntry).where(eq(watchlistEntry.id, id)).get()) ?? null,
            );
        },

        findByTmdbId(userId, tmdbId) {
            return executeDbOperation(
                async () =>
                (await _db.select().from(watchlistEntry)
                    .where(and(eq(watchlistEntry.userId, userId), eq(watchlistEntry.tmdbId, tmdbId)))
                    .get()) ?? null,
            );
        },

        findMany({ userId, status, favorite }) {
            return executeDbOperation(async () =>
                await _db.query.watchlistEntry.findMany({
                    where: { userId, status, favorite },
                    orderBy: { createdAt: "desc" },
                }),
            );
        },

        update(id, userId, data) {
            return executeDbOperation(
                async () =>
                    (await _db
                        .update(watchlistEntry)
                        .set(data)
                        .where(and(eq(watchlistEntry.id, id), eq(watchlistEntry.userId, userId)))
                        .returning()
                        .get()) ?? null,
            );
        },

        remove(id, userId) {
            return executeDbOperation(async () => {
                await _db
                    .delete(watchlistEntry)
                    .where(and(eq(watchlistEntry.id, id), eq(watchlistEntry.userId, userId)))
            });
        },
    };
}

export const repository = createWatchlistRepository(db);
