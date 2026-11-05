import z from "zod";
import { WATCHLIST_STATUS } from "@/db/schema";

export const createWatchlistSchema = z.object({
    tmdbId: z.number("tmdbid må være et tall").int().positive(),
    title: z.string("Tittel må være en tekst").trim(),
    posterPath: z.string("posterPath må være en tekst").nullable().optional(),
    status: z.enum(WATCHLIST_STATUS, "Ugyldig status").optional(),
    rating: z.number("Rating må være et tall").int().nullable().optional(),
    favorite: z.boolean("Favorite må være true eller false").optional(),
    comment: z.string("Kommentar må være en tekst").trim().nullable().optional(),
});

// Bare disse feltene kan endres. Zod fjerner alle andre (id, userId, tmdbId ...)
export const updateWatchlistSchema = createWatchlistSchema
.pick({ status: true, rating: true, favorite: true, comment: true })
.partial();

// Query-parametere kommer som tekst: ?status=watching&favorite=true
export const listParamsSchema = z.object({
    status: z.enum(WATCHLIST_STATUS, "Ugyldig status").optional(),
    favorite: z
    .enum(["true", "false"], "Favorite må være true eller false")
    .transform((value) => value === "true")
    .optional(),
});

export type CreateWatchlistInput = z.infer<typeof createWatchlistSchema>;
export type UpdateWatchlistInput = z.infer<typeof updateWatchlistSchema>;
export type ListWatchlistParams = z.infer<typeof listParamsSchema>;
