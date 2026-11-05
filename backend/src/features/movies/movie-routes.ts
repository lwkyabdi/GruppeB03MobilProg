import { env } from "cloudflare:workers";
import { route } from "rwsdk/router";
import { searchMoviesController } from "./movie-controller";

export const movieRoutes = [
  route("/api/v1/movies", {
    get: ({ request }) => {
      const token = env.TMDB_READ_ACCESS_TOKEN;

      if (!token) {
        return Response.json(
          { error: "TMDB-token mangler på serveren" },
          { status: 500 },
        );
      }

      return searchMoviesController(request, token);
    },
  }),
];
