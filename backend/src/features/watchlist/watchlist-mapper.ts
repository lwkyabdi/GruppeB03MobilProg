import type {WatchlistEntry,} from "@/db/schema";

export type WatchlistDTO = {
    id: string;
    tmdbId: number;
    title: string;
    posterPath: string | null;
    status: WatchlistEntry["status"];
    rating: number | null;
    favorite: boolean;
    comment: string | null;
    createdAt: string;
};

// Gjør en databaserad om til det klienten forventer. userId blir ikke med.
export function toWatchlistDTO(entry: WatchlistEntry): WatchlistDTO {
    const { id, tmdbId, title, posterPath, status, rating, favorite, comment, createdAt } = entry;

    return { id, tmdbId, title, posterPath, status, rating, favorite, comment, createdAt: createdAt.toISOString(),
    };
}
