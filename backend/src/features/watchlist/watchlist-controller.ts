// Her tar vi imot requesten og sender response. Ingen forretningsregler:
// de ligger i servicen. Controlleren oversetter Result til HTTP.

import type { RequestInfo } from "rwsdk/worker";
import { requireActionUser } from "@/features/auth/auth-guard";
import { jsonResult } from "@/lib/http";
import { Errors, ResultHandler } from "@/lib/result";
import { parseParams } from "./utils/parse-params";
import { service, type WatchlistService } from "./watchlist-service";

export interface WatchlistController {
  list(requestInfo: RequestInfo): Promise<Response>;
  create(requestInfo: RequestInfo): Promise<Response>;
  find(requestInfo: RequestInfo): Promise<Response>;
  update(requestInfo: RequestInfo): Promise<Response>;
  remove(requestInfo: RequestInfo): Promise<Response>;
}

async function readJson(request: Request) {
  try {
    return ResultHandler.success<unknown>(await request.json());
  } catch {
    return ResultHandler.failure<unknown>(
      "Body må være JSON",
      Errors.BAD_REQUEST,
    );
  }
}

export function createWatchlistController(
  _service: WatchlistService,
): WatchlistController {
  return {
    // GET /api/v1/watchlist?status=watching&favorite=true
    // 200, 400 (ugyldig filter) eller 401
    async list({ request, ctx }) {
      const auth = requireActionUser(ctx.user);
      if (!auth.ok) return jsonResult(auth);

      return jsonResult(
        await _service.list(auth.user.id, parseParams(request)),
      );
    },

    // POST /api/v1/watchlist med JSON, f.eks. { "tmdbId": 603, "title": "The Matrix" }
    // 201, 400, 401 eller 409 (finnes fra før)
    async create({ request, ctx }) {
      const auth = requireActionUser(ctx.user);
      if (!auth.ok) return jsonResult(auth);

      const body = await readJson(request);
      if (!body.ok) return jsonResult(body);

    return jsonResult(await _service.create(auth.user.id, body.data), 201);
    },

    // GET /api/v1/watchlist/:id
    // 200, 401, 403 eller 404
    async find({ params, ctx }) {
      const auth = requireActionUser(ctx.user);
      if (!auth.ok) return jsonResult(auth);

      return jsonResult(await _service.findById(auth.user.id, params.id));
    },

    // PATCH /api/v1/watchlist/:id med JSON, f.eks. { "rating": 8 }
    // 200, 400, 401, 403 eller 404
    async update({ request, params, ctx }) {
      const auth = requireActionUser(ctx.user);
      if (!auth.ok) return jsonResult(auth);

      const body = await readJson(request);
      if (!body.ok) return jsonResult(body);

      return jsonResult(
        await _service.update(auth.user.id, params.id, body.data),
      );
    },

    // DELETE /api/v1/watchlist/:id
    // 204 uten body, ellers 401, 403 eller 404
    async remove({ params, ctx }) {
      const auth = requireActionUser(ctx.user);
      if (!auth.ok) return jsonResult(auth);

      const result = await _service.remove(auth.user.id, params.id);

      return result.ok
        ? new Response(null, { status: 204 })
        : jsonResult(result);
    },
  };
}

export const controller = createWatchlistController(service);
