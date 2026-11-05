# MovieMate REST-kontrakt

Base URL settes med `EXPO_PUBLIC_API_URL`. Beskyttede kall bruker `Authorization: Bearer <token>`. Token kommer fra responsheaderen `set-auth-token` ved innlogging/registrering og lagres i SecureStore på mobil. Native kall sender `Origin: moviemate://`, som er eksplisitt tillatt i Better Auth; cookie- og origin-sjekker er beholdt på serveren. Mobilklienten bruker `credentials: omit` og autentiserer med bearer-token.

| Metode | Sti | Svar |
| --- | --- | --- |
| GET | `/api/status` | `{ status: "ok", version: "0.1.0" }`, offentlig |
| POST | `/api/auth/sign-up/email` | Better Auth, body `{ name, email, password }` |
| POST | `/api/auth/sign-in/email` | Better Auth, body `{ email, password }` |
| POST | `/api/auth/sign-out` | Better Auth, beskyttet sesjon |
| GET | `/api/me` | Innlogget bruker `{ id, name, email }` i `data` |
| GET | `/api/v1/movies?query=Matrix` | Liste med filmer, søk 1–200 tegn |
| GET | `/api/v1/movies/popular` | Første side populære filmer |
| GET | `/api/v1/movies/:id` | Én film, positiv heltalls-ID |
| GET | `/api/v1/watchlist` | Egen liste, eventuelt `?status=wanted&favorite=true` |
| POST | `/api/v1/watchlist` | Opprett, body `{ tmdbId, title, posterPath }`, 201 |
| GET | `/api/v1/watchlist/:id` | Egen oppføring |
| PATCH | `/api/v1/watchlist/:id` | Endre `{ status?, rating?, favorite?, comment? }` |
| DELETE | `/api/v1/watchlist/:id` | Slett egen oppføring, 204 uten body |

Alle `/api/v1/*` og `/api/me` krever sesjon. Disse svarer `{ ok: true, data: ... }` ved suksess, og `{ ok: false, error: { code, message, fieldErrors } }` ved feil. Auth-rutene beholder Better Auths format. Mobilklienten validerer data med Zod og håndterer begge feiltyper.

Film: `{ id: number, title, overview, poster_path: string | null, release_date, vote_average: number }`.

Oppføring: `{ id: string, tmdbId: number, title, posterPath: string | null, status, rating: number | null, favorite: boolean, comment: string | null, createdAt: string }`. Status er `wanted`, `watching` eller `completed`. Vurdering er heltall 1–10 eller null, kommentar maks 500 tegn og tittel 1–200 tegn. E-post/passord styres av Better Auth, passord minst åtte tegn.

400 betyr ugyldig input, 401 manglende/utløpt sesjon, 403 en annen brukers oppføring, 404 ukjent ressurs og 409 duplikatfilm i samme liste. TMDB-feil blir 502, manglende serverkonfigurasjon 500. Filmlisten bruker streng-ID; filmdetaljer bruker TMDBs tall-ID.
