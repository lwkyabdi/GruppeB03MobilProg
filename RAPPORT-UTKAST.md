# MovieMate – rapportunderlag for Gruppe B03

**Utkast, ikke ferdig prosjektrapport.** Gruppen må fylle inn faktiske navn, arbeidsdeling, erfaringer og sign-off-materiale, bearbeide teksten og eksportere til tre sider ±10 %. Ikke lever påstander om arbeid eller læring dere ikke kan stå inne for.

**Gruppemedlemmer:** Fyll inn alle navn. **Repo:** https://github.com/lwkyabdi/GruppeB03MobilProg

## Prosjekt og mål

MovieMate hjelper brukeren å finne filmer og holde oversikt over hva de vil se, ser nå og har sett. Mobilappen bygger på gruppens webprosjekt. Målet er tilsvarende kjernefunksjoner og visuell stil, tilpasset en telefon og mobilfagets krav. Brukeren oppretter konto, søker etter en film, åpner detaljer, legger filmen til i en personlig liste og redigerer status, vurdering, favoritt og kommentar.

Prosjektet bruker Expo, React Native og TypeScript. Webappens React-komponenter, CSS og server actions er ikke flyttet inn i mobilen. Mobilskjermene bruker View, Text, Pressable, TextInput og FlatList. Den mørke bakgrunnen, panelene og lilla aksentfargen er hentet fra webdesignen.

Vi har avgrenset bort roller, sosiale funksjoner, kamera, varsler og offline-synkronisering. Filmlisten er personlig og lagres på serveren. Denne avgrensningen gjør hovedflyten kort og mulig å forklare, og gir plass til innlogging, datalagring, validering og testing.

## Arkitekturvalg

Expo Router gir filbasert navigasjon. Roten har en beskyttet stack som skiller auth-rutene fra innloggede ruter. Appdelen har tre faner: Oppdag, Min filmliste og Profil. Filmdetaljer og redigering ligger i en stack over fanene. Dette passer mobilbruk: brukeren kan bytte hovedområde og gå tilbake fra en detalj uten å miste hovedstrukturen.

AuthContext holder brukeren og håndterer innlogging, gjenoppretting og utlogging. Better Auth returnerer et sesjonstoken i headeren `set-auth-token`; mobilen lagrer dette i SecureStore og sender det som bearer-token. Ved oppstart sjekkes `/api/me` før beskyttede skjermer vises. Nettbrudd gir mulighet til å prøve igjen, mens en ugyldig sesjon fjernes. Utlogging fjerner også Query-cachen, slik at data fra en tidligere bruker ikke vises etter kontobytte.

TanStack Query håndterer serverdata. AuthContext er klienttilstand, mens filmer og watchlist eies av API-et. `useQuery` gir lasting, feil, cache og ny henting. `useMutation` gjør endringer og invaliderer filmlisten etter suksess. Vi valgte dette fremfor en ekstra context og egen cachelogikk for filmer. Cachen er en midlertidig kopi; den varige filmlisten ligger i D1.

Mobilens API-klient samler HTTP-kall, token-header, timeout og feilhåndtering. Zod validerer serversvar før de brukes i skjermene. Controlled inputs brukes i registrering, innlogging og redigering; ugyldig e-post, kort passord, ugyldig vurdering og for lang kommentar gir feil ved det aktuelle feltet. En vurdering er heltall fra 1 til 10 eller null. Backenden validerer også input, fordi mobilens validering kan omgås.

Backend er gjenbrukt fra webprosjektet og kjører RedwoodSDK med Better Auth, Drizzle og D1. TMDB-nøkkelen ligger bare der. Under ferdigstillingen ble filmsøkets svarformat tilpasset watchlist-kontrakten, og eksisterende services for populære filmer og detaljer fikk REST-endepunkter. Begge klientene kan bruke samme backend, men den inkluderte kopien gir ikke automatisk samme database som en separat webserver. Deling krever at begge peker til samme server og D1-binding.

## Mobiltilpasning og sikkerhet

FlatList brukes i filmsøk og filmliste slik at ikke alle elementer må rendres samtidig. Oppdag velger antall kolonner fra skjermbredden. Appen tillater portrett og landskap, skjemaene kan rulles og knappene har minst 48 enheter høyde. Gruppen må beskrive de konkrete enhetene og resultatene fra manuell test før levering.

Navigasjonsguards er brukeropplevelse, ikke tilgangskontroll. Backend henter brukeren fra sesjonen og kontrollerer eier ved lesing, endring og sletting av en oppføring. En annen brukers ID gir derfor ikke tilgang. Native auth-kall sender en konkret godkjent origin, og backendens origin-sjekk er beholdt. Ingen API-hemmeligheter ligger i `EXPO_PUBLIC_*`. Lokal utvikling bruker HTTP; en publisert backend må bruke HTTPS.

## Testing og verifikasjon

Mobiltestene bruker Jest, jest-expo og Testing Library. Enhetstester dekker skjemaer og API-feil. Komponenttesten kontrollerer tittel, år, manglende plakat og trykk på filmkortet. Hovedflyttesten bruker ekte skjermer, AuthProvider og QueryClientProvider, med mocket API, SecureStore og navigasjon. Den logger inn, søker, legger til film, finner filmen i listen, endrer favoritt, gjenoppretter etter omstart og logger ut. Den viser samspill mellom komponenter og datalag, men erstatter ikke kjøring på telefon.

Backend har Vitest-tester for blant annet validering, forretningsregler og den felles filmkontrakten. En separat HTTP-test ble kjørt mot lokal server med ekte D1 og TMDB. Den kontrollerte registrering, innlogging, CRUD, ratingvalidering, eierskap og ugyldiggjøring av token ved utlogging. Typekontroll, native bundle-eksport og backendens produksjonsbygg er også gjennomført.

**Fyll inn gruppens manuelle tester:** enheter, skjermstørrelser, orientering, tastatur, nettbrudd, omstart og eventuelle feil dere rettet. Bruk protokollen i LEVERING.md.

## KI, arbeidsdeling og læringsutbytte

Codex ble brukt til gjennomgang, implementering av mobilens API- og auth-lag, native skjermflyt, testoppsett og dokumentasjon. Eksisterende backend og forretningsregler ble gjenbrukt. KI-LOGG.md viser konkrete filer. Et avvik verktøyet oppdaget var forskjellen mellom planens API-format og den faktiske filmcontrolleren. Ekte integrasjonstest avdekket i tillegg manglende origin ved innlogging; dette ble rettet før HTTP-testen besto.

**Gruppen må skrive selv:** Hvem gjorde hvilke deler? Hvilken KI-kode måtte dere rette? Hvordan oppdaget dere feilen? Velg én konkret fil dere kan forklare og endre. Beskriv hva som fungerte, hva dere ville gjort annerledes og hva dere nå kan som dere ikke kunne i august. Skill arbeid utført før og under ferdigstillingen.

**Sign-off-vedlegg:** Legg til den faktiske kravlisten, avgrensningen, prosessverktøyet med fordelte oppgaver, originale skisser, KI-avtalen og dokumentasjon fra uke 40. Skissen i LEVERING.md er laget ved ferdigstillingen og skal ikke presenteres som et opprinnelig planleggingsartefakt.
