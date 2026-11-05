export async function searchMovies(
  query: string,
  token: string,
): Promise<unknown> {
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB-søket feilet: ${response.status}`);
  }

  return response.json();
}
//testen i terminaalen for Interstellar med kommandoen:
// @'
// import { searchMovies } from "./src/features/movies/tmdb-client.ts";

// const data = await searchMovies(
//   "Interstellar",
//   process.env.TMDB_READ_ACCESS_TOKEN
// );

// console.log(JSON.stringify(data, null, 2));
// '@ | node --env-file=.dev.vars --import=tsx --input-type=module
export async function fetchPopularMovies(token: string): Promise<unknown> {
  const response = await fetch("https://api.themoviedb.org/3/movie/popular", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB-kallet feilet: ${response.status}`);
  }

  return response.json();
}

export async function fetchMovieDetails(id: number, token: string): Promise<unknown> {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`TMDB-kallet feilet: ${response.status}`);
  }

  return response.json();
}
