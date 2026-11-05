import { describe, expect, it } from "vitest";
import { tmdbSearchSchema } from "./tmdb-schema";

const movie = {
  id: 157336,
  title: "Interstellar",
  overview: "En reise gjennom verdensrommet.",
  poster_path: null,
  release_date: "2014-11-05",
  vote_average: 8.4,
};

describe("tmdbSearchSchema", () => {
  it("godtar en gyldig film uten plakat", () => {
    const result = tmdbSearchSchema.safeParse({
      results: [movie],
    });

    expect(result.success).toBe(true);
  });

  it("avviser en film med id som tekst", () => {
    const result = tmdbSearchSchema.safeParse({
      results: [{ ...movie, id: "feil" }],
    });

    expect(result.success).toBe(false);
  });

  it("godtar et søk uten treff", () => {
    const result = tmdbSearchSchema.safeParse({
      results: [],
    });

    expect(result.success).toBe(true);
  });
});
// Hele testkoden i denne filen er generert av ChatGPT.
// ChatGPT foreslo også testtilfellene og forklarte hvordan testene fungerer.

// En gyldig film med `poster_path: null` | Godtas — en film kan mangle plakat
// En film med `id: "feil"` | Avvises — ID skal være et positivt heltall
// Et søkeresultat med `results: []` | Godtas — et søk kan gi null treff
