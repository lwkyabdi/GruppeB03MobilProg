export const TITLE_MAX_LENGTH = 200;
export const COMMENT_MAX_LENGTH = 500;
export const RATING_MIN = 1;
export const RATING_MAX = 10;

export type EntryField = "title" | "rating" | "comment";

export type EntryValidation =
    | { ok: true }
    | { ok: false; field: EntryField; error: string };

export function validateEntry(entry: {
    title?: string;
    rating?: number | null;
    comment?: string | null;
}): EntryValidation {
    if (entry.title !== undefined) {
        const title = entry.title.trim();
        if (title.length === 0) {
            return { ok: false, field: "title", error: "Tittel kan ikke være tom" };
        }
        if (title.length > TITLE_MAX_LENGTH) {
            return {
                ok: false,
                field: "title",
                error: `Tittel kan være maks ${TITLE_MAX_LENGTH} tegn`,
            };
        }
    }

    // null betyr "ikke vurdert"
    if (entry.rating !== undefined && entry.rating !== null) {
        const validRating =
          Number.isInteger(entry.rating) &&
          entry.rating >= RATING_MIN &&
          entry.rating <= RATING_MAX;

        if (!validRating) {
            return {
                ok: false,
                field: "rating",
                error: `Rating må være et heltall mellom ${RATING_MIN} og ${RATING_MAX}`,
            };
        }
    }

    if (entry.comment && entry.comment.length > COMMENT_MAX_LENGTH) {
        return {
            ok: false,
            field: "comment",
            error: `Kommentar kan være maks ${COMMENT_MAX_LENGTH} tegn`,
        };
    }

    return { ok: true };
}
