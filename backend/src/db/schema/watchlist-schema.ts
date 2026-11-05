import { text, sqliteTable, integer, unique } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";
import { createId } from "@/lib/id";

export const WATCHLIST_STATUS = ["wanted", "watching", "completed"] as const;
export type WatchlistStatus = (typeof WATCHLIST_STATUS)[number];

export const watchlistEntry = sqliteTable(
    "watchlist_entry",
    {
    id: text("id")
        .primaryKey()
        .$default(() => createId()),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    tmdbId: integer("tmdb_id").notNull(),
    title: text("title").notNull(),
    posterPath: text("poster_path"),
    status: text("status", { enum: WATCHLIST_STATUS })
        .notNull()
        .default("wanted"),
    rating: integer("rating"),
    favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
    comment: text("comment"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .$default(() => new Date()),
},
(table) => [unique("uq_watchlist_user_tmdb").on(table.userId, table.tmdbId),],
);

export type WatchlistEntry = typeof watchlistEntry.$inferSelect;
export type NewWatchlistEntry = typeof watchlistEntry.$inferInsert;
export type UpdateWatchlistEntry = Partial<
    Pick<NewWatchlistEntry, "status" | "rating" | "favorite" | "comment">
    >;
