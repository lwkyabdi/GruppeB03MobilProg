import { describe, expect, it, test } from "vitest";
import { jsonResult, statusFromCode } from "../http";
import { Errors, ResultHandler } from "../result";

describe("statusFromCode", () => {
    it("gjør feilkoder om til HTTP-statuskoder", () => {
        expect(statusFromCode(Errors.BAD_REQUEST)).toBe(400);
        expect(statusFromCode(Errors.UNAUTHORIZED)).toBe(401);
        expect(statusFromCode(Errors.FORBIDDEN)).toBe(403);
        expect(statusFromCode(Errors.NOT_FOUND)).toBe(404);
        expect(statusFromCode(Errors.CONFLICT)).toBe(409);
        expect(statusFromCode(Errors.BAD_GATEWAY)).toBe(502);
        expect(statusFromCode(Errors.INTERNAL_SERVER_ERROR)).toBe(500);
    });
});

describe("jsonResult", () => {
    it("sender suksess med gitt statuskode", async() => {
        const response = jsonResult(ResultHandler.success({ id: "a" }), 201);

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ ok: true, data: { id: "a" } });
    });

    it("sender feil med statuskode fra feilkode", async() => {
        const response = jsonResult(
            ResultHandler.failure("Finnes ikke", Errors.NOT_FOUND),
        );

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({
            ok: false,
            error: { code: "NOT_FOUND", message: "Finnes ikke", fieldErrors: {} },
        });
    });
});
