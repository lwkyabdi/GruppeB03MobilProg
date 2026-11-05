import {describe, expect, it} from "vitest";
import {
    COMMENT_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    validateEntry,
} from "../utils/validate-entry";

describe("validateEntry", () => {
    it("godtar en gyldig oppføring", () => {
        expect(validateEntry({ title: "Tittel", rating: 5, comment: "Kommentar" })).toEqual(
            { ok: true },
        );
    });

    it("hopper over felt som ikke er med", () => {
        expect(validateEntry({})).toEqual({ ok: true });
    });

    it("godtar rating 1 og 10, men ikke 0 og 11", () => {
        expect(validateEntry({ rating: 1 }).ok).toBe(true);
        expect(validateEntry({ rating: 10 }).ok).toBe(true);
        expect(validateEntry({ rating: 0 })).toMatchObject({
            ok: false,
            field: "rating",
         });
        expect(validateEntry({ rating: 11 })).toMatchObject({
            ok: false,
            field: "rating",
        });
    });

    it("avviser trating som ikke er heltall", () => {
        expect(validateEntry({ rating: 5.5 })).toMatchObject({
            ok: false,
            field: "rating",
        });
    });

    it("godtar rating null (ikke vurdert)", () => {
        expect(validateEntry({ rating: null })).toEqual({ ok: true });
    });

    it("avviser tom tittel", () => {
        expect(validateEntry({ title: "" })).toMatchObject({
            ok: false,
            field: "title",
        });
    });

    it("avviser for lang tittel og kommentar", () => {
        expect(
        validateEntry({ title: "a".repeat(TITLE_MAX_LENGTH + 1) }),
      ).toMatchObject({ ok: false, field: "title" });
      expect(
        validateEntry({ comment: "a".repeat(COMMENT_MAX_LENGTH + 1) }),
      ).toMatchObject({ ok: false, field: "comment" });
    });
});
