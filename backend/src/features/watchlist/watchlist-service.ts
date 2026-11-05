import z from "zod";
import type { WatchlistEntry } from "@/db/schema";
import { Errors, ResultHandler, type Result } from "@/lib/result";
import { toWatchlistDTO, type WatchlistDTO } from "./watchlist-mapper";
import { repository, type WatchlistRepository } from "./watchlist-repository";
import { createWatchlistSchema, listParamsSchema, updateWatchlistSchema,} from "./watchlist-schema";
import type { Params } from "./utils/parse-params";
import { validateEntry } from "./utils/validate-entry";

export interface WatchlistService {
  list(userId: string, params?: Params): Promise<Result<WatchlistDTO[]>>;
  findById(userId: string, id: string): Promise<Result<WatchlistDTO>>;
  create(userId: string, input: unknown): Promise<Result<WatchlistDTO>>;
  update(userId: string, id: string, input: unknown): Promise<Result<WatchlistDTO>>;
  remove(userId: string, id: string): Promise<Result<void>>;
}

export function createWatchlistService(
  _repository: WatchlistRepository,
): WatchlistService {
  // Felles eierskapssjekk: 404 hvis den ikke finnes, 403 hvis den er noen andre sin.
  async function getOwned(
    userId: string,
    id: string,
  ): Promise<Result<WatchlistEntry>> {
    const found = await _repository.findById(id);
    if (!found.ok) return found;

    if (!found.data) {
      return ResultHandler.failure("Oppføringen finnes ikke", Errors.NOT_FOUND);
    }
    if (found.data.userId !== userId) {
      return ResultHandler.failure("Dette er ikke din oppføring", Errors.FORBIDDEN);
    }
    return ResultHandler.success(found.data);
  }

  return {
    async list(userId, params = {}) {
      const parsed = listParamsSchema.safeParse(params);
      if (!parsed.success) {
        return ResultHandler.failure(
          "Ugyldig parameter",
          Errors.BAD_REQUEST,
          z.flattenError(parsed.error).fieldErrors,
        );
      }

      const result = await _repository.findMany({ userId, ...parsed.data });
      if (!result.ok) return result;

      return ResultHandler.success(result.data.map(toWatchlistDTO));
    },

    async findById(userId, id) {
      const owned = await getOwned(userId, id);
      if (!owned.ok) return owned;

      return ResultHandler.success(toWatchlistDTO(owned.data));
    },

    async create(userId, input) {
      const parsed = createWatchlistSchema.safeParse(input);
      if (!parsed.success) {
        return ResultHandler.failure(
          "Feil med data",
          Errors.BAD_REQUEST,
          z.flattenError(parsed.error).fieldErrors,
        );
      }

      const rule = validateEntry(parsed.data);
      if (!rule.ok) {
        return ResultHandler.failure("Ikke gyldig data", Errors.BAD_REQUEST, {
          [rule.field]: [rule.error],
        });
      }

      // userId kommer fra innlogget bruker, aldri fra input
      const existing = await _repository.findByTmdbId(userId, parsed.data.tmdbId);
      if (!existing.ok) return existing;
      if (existing.data) {
        return ResultHandler.failure(
          "Filmen ligger allerede i watchlisten",
          Errors.CONFLICT,
        );
      }

      const created = await _repository.create({ ...parsed.data, userId });
      if (!created.ok) return created;

      return ResultHandler.success(toWatchlistDTO(created.data));
    },

    async update(userId, id, input) {
      // Zod fjerner alle felt unntatt status, rating, favorite og comment
      const parsed = updateWatchlistSchema.safeParse(input);
      if (!parsed.success) {
        return ResultHandler.failure(
          "Feil med data",
          Errors.BAD_REQUEST,
          z.flattenError(parsed.error).fieldErrors,
        );
      }

      if (Object.keys(parsed.data).length === 0) {
        return ResultHandler.failure("Ingen felt å oppdatere", Errors.BAD_REQUEST);
      }

      const rule = validateEntry(parsed.data);
      if (!rule.ok) {
        return ResultHandler.failure("Ikke gyldig data", Errors.BAD_REQUEST, {
          [rule.field]: [rule.error],
        });
      }

      const owned = await getOwned(userId, id);
      if (!owned.ok) return owned;

      const updated = await _repository.update(id, userId, parsed.data);
      if (!updated.ok) return updated;
      if (!updated.data) {
        return ResultHandler.failure("Oppføringen finnes ikke", Errors.NOT_FOUND);
      }

      return ResultHandler.success(toWatchlistDTO(updated.data));
    },

    async remove(userId, id) {
      const owned = await getOwned(userId, id);
      if (!owned.ok) return owned;

      return _repository.remove(id, userId);
    },
  };
}

export const service = createWatchlistService(repository);
