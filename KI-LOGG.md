# KI-logg

## 5. november 2026 – Codex

Oppdrag: lese kurskrav og opprinnelig plan, sammenligne mobilprosjektet med gruppens webrepo, implementere mobilflyten og skrive leveringsdokumentasjon.

Konkrete bidrag:

- `MovieMate/src/api/*`: HTTP-klient, bearer-token, timeout, API-feil og Zod-validering av serversvar.
- `MovieMate/src/contexts/AuthContext.tsx` og `src/utils/token-storage.ts`: innlogging, gjenoppretting og utlogging med SecureStore.
- `MovieMate/src/app/*`, `src/components/auth-form.tsx`, `src/components/ui.tsx`, `src/components/movie/MovieCard.tsx` og `src/hooks/use-watchlist.ts`: native navigasjon og skjermflyt, validerte skjemaer, filmliste, cache og webappens farger.
- `backend/src/features/movies/movie-controller.ts` og `movie-routes.ts`: felles API-format, beskyttelse, populære filmer og filmdetaljer. Eksisterende TMDB-service ble gjenbrukt.
- `MovieMate/src/__tests__/*`, Jest-oppsett og backendens `movie-controller.test.ts`: tester og feilretting.
- README, API-kontrakt, leveringsunderlag og pakkescript.

Webrepoets API, database, Better Auth og watchlist-regler er eksisterende gruppearbeid. Codex har ikke skrevet om Git-historikken eller tilskrevet nye bidrag til gruppemedlemmer.

Et konkret avvik oppdaget i gjennomgangen var at planen forventet `{ ok, data }` for filmsøk mens den faktiske controlleren returnerte `{ results }`. Controlleren ble endret og kontrakten fikk test. Testoppsettet måtte også tilpasses faktiske SDK-/Testing Library-versjoner, inkludert asynkrone testkall og regenerering av rutetyper. Første ekte innlogging feilet fordi Better Auth krevde en godkjent origin; native klient sender nå `moviemate://`, og serveren tillater denne eksplisitt uten å slå av sikkerhetssjekkene. Koden ble formatert med Prettier for lesbarhet.

Gruppen må selv supplere med hva dere leste, endret og lærte, og peke på ett tilfelle der dere oppdaget en feil i KI-forslaget. Denne loggen dokumenterer verktøyets arbeid; den bekrefter ikke gruppens forståelse eller at alle har kvalitetssikret koden.
