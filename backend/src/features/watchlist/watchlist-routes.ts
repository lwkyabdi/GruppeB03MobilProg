import { route } from "rwsdk/router";
import { requireUser } from "@/features/auth/middleware";
import { controller } from "./watchlist-controller";

export const watchlistRoutes = [
    route("/api/v1/watchlist", {
        get: [requireUser, controller.list],
        post: [requireUser, controller.create],
    }),
    route("/api/v1/watchlist/:id", {
        get: [requireUser, controller.find],
        patch: [requireUser, controller.update],
        delete: [requireUser, controller.remove],
    }),
];
