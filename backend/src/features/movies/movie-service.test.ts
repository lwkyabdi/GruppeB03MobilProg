// Hele testkoden i denne filen er generert av ChatGPT.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchMovies, fetchMovieDetails } from "./tmdb-client";
import { searchMovieResults, getMovieDetails } from "./movie-service";

// Erstatter TMDB-klienten, slik at testene ikke bruker nettverk eller ekte token.
vi.mock("./tmdb-client", () => ({
  searchMovies: vi.fn(),
  fetchMovieDetails: vi.fn(),
}));

const movie = {
  id: 157336,
  title: "Interstellar",
  overview: "En reise gjennom verdensrommet.",
  poster_path: null,
  release_date: "2014-11-05",
  vote_average: 8.4,
};

beforeEach(() => {
  vi.mocked(searchMovies).mockReset();
  vi.mocked(fetchMovieDetails).mockReset();
});

describe("searchMovieResults", () => {
  it("sender søket videre og returnerer validerte filmer", async () => {
    vi.mocked(searchMovies).mockResolvedValue({ results: [movie] });

    const result = await searchMovieResults("Interstellar", "test-token");

    expect(searchMovies).toHaveBeenCalledWith("Interstellar", "test-token");
    expect(result).toEqual([movie]);
  });

  it("avviser filmdata med ugyldig id", async () => {
    vi.mocked(searchMovies).mockResolvedValue({
      results: [{ ...movie, id: "feil" }],
    });

    await expect(searchMovieResults("Interstellar", "test-token"))
      .rejects.toThrow("TMDB returnerte ugyldige filmdata");
  });

  it("returnerer en tom liste ved ingen treff", async () => {
    vi.mocked(searchMovies).mockResolvedValue({ results: [] });

    await expect(searchMovieResults("ingen treff", "test-token"))
      .resolves.toEqual([]);
  });

  it("sender feilen videre hvis TMDB-klienten feiler", async () => {
    vi.mocked(searchMovies).mockRejectedValue(new Error("TMDB-søket feilet: 503"));

    await expect(searchMovieResults("Interstellar", "test-token"))
      .rejects.toThrow("TMDB-søket feilet: 503");
  });
});

describe("getMovieDetails", () => {
  it("henter valgt film og returnerer validerte data", async () => {
    vi.mocked(fetchMovieDetails).mockResolvedValue(movie);
    await expect(getMovieDetails(157336, "test-token")).resolves.toEqual(movie);
    expect(fetchMovieDetails).toHaveBeenCalledWith(157336, "test-token");
  });

  it("returnerer null når filmen ikke finnes", async () => {
    vi.mocked(fetchMovieDetails).mockResolvedValue(null);
    await expect(getMovieDetails(157336, "test-token")).resolves.toBeNull();
  });

  it("avviser ugyldige filmdata", async () => {
    vi.mocked(fetchMovieDetails).mockResolvedValue({ ...movie, id: "feil" });
    await expect(getMovieDetails(157336, "test-token"))
      .rejects.toThrow("TMDB returnerte ugyldige filmdata");
  });

  it("sender feil fra TMDB videre", async () => {
    vi.mocked(fetchMovieDetails).mockRejectedValue(new Error("TMDB-kallet feilet: 503"));
    await expect(getMovieDetails(157336, "test-token"))
      .rejects.toThrow("TMDB-kallet feilet: 503");
  });
});
