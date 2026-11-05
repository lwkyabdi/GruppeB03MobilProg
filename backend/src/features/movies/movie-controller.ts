import { searchMovieResults } from "./movie-service";

export async function searchMoviesController(
  request: Request,
  token: string,
): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();

  if (!query) {
    return Response.json(
      { error: "Du må oppgi en søketekst" },
      { status: 400 },
    );
  }

  try {
    const movies = await searchMovieResults(query, token);

    return Response.json({ results: movies });
  } catch {
    return Response.json(
      { error: "Kunne ikke hente filmer fra TMDB" },
      { status: 502 },
    );
  }
}
