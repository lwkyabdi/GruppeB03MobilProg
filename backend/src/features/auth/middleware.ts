import { RouteMiddleware } from "rwsdk/router";
import { auth } from "./auth";
import { toSessionUser } from "./auth-types";
import { unauthorizedError } from "./auth-guard";


export const setUser: RouteMiddleware = async ({ response, ctx, request }) => {
   try {
     const session = await auth.api.getSession({ headers: request.headers });
     ctx.user = session ? toSessionUser(session.user) : null;
   } catch (error) {
     console.error("Kunne ikke lese sesjon: ", error);
     ctx.user = null;
   }

   if (ctx.user) {
    response.headers.set("Cache-Control", "private, no-store");
  }
};

export const requireUser: RouteMiddleware = ({ ctx }) => {
  if (!ctx.user) {
    return Response.json(
      { ok: false, error: unauthorizedError() },
      { status: 401 },
    );
  }
};
