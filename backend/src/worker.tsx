import { defineApp } from "rwsdk/worker";
import { route } from "rwsdk/router";
import { setCommonHeaders } from "@/app/headers";
import { movieRoutes } from "@/features/movies/movie-routes";
import type { SessionUser } from "./features/auth/auth-types";
import { requireUser, setUser } from "./features/auth/middleware";
import { authRoutes } from "./features/auth/auth-routes";
import { watchlistRoutes } from "@/features/watchlist/watchlist-routes";

export type AppContext = {
  user: SessionUser | null;
};

const app = defineApp([
  setCommonHeaders(),
  setUser,
  ...watchlistRoutes,
  ...authRoutes,
  route("/api/me", [
    requireUser,
    ({ ctx }) => Response.json({ ok: true, data: ctx.user }),
  ]),
  ...movieRoutes,
  route("/api/status", () =>
    Response.json({ status: "ok", version: "0.1.0" })
  ),
]);

export default { fetch: app.fetch };
