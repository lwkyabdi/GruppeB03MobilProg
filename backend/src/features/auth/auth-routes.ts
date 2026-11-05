import { route } from "rwsdk/router";
import { auth } from "./auth";

export const authRoutes = [
    route("/api/auth/*", ({ request }) => auth.handler(request)),
];
