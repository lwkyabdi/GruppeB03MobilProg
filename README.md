# MovieMate – Gruppe B03

MovieMate er en mobilapp for å oppdage filmer og holde oversikt over filmer du vil se, ser nå og har sett. Du kan opprette konto, søke i TMDB, lagre filmer, gi en vurdering fra 1 til 10, skrive kommentar og merke favoritter. Appen er skrevet med Expo, React Native og TypeScript; data lagres via RedwoodSDK, Better Auth og Drizzle/D1.

## Start fra en ren klone

Du trenger Node.js 22.13 eller nyere, npm 11 eller nyere og en Expo-klient som støtter SDK 58. Android-emulator fungerer på Windows; iOS-simulator krever macOS. Behold versjonene og lockfilene. På Windows kan `npm.cmd` og `npx.cmd` brukes hvis PowerShell blokkerer `npm.ps1`.

Terminal 1, fra repoets rot:

```powershell
cd backend
npm ci
if (!(Test-Path .dev.vars)) { Copy-Item .dev.vars.example .dev.vars }
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Fyll inn den genererte verdien som `BETTER_AUTH_SECRET` i `backend/.dev.vars`, og sett `TMDB_READ_ACCESS_TOKEN` til din TMDB Read Access Token. Behold `BETTER_AUTH_URL=http://localhost:5173` ved lokal kjøring. Ikke overskriv en eksisterende konfigurasjon. Hemmelighetene skal bare ligge på serveren.

```powershell
npm run migrate:dev
npm run dev -- --host 0.0.0.0
```

Kontroller `http://localhost:5173/api/status`: forvent `{"status":"ok","version":"0.1.0"}`. Backend har ingen webside. Migrasjonene oppretter lokal D1-lagring i `backend/.wrangler/`; ingen Cloudflare-konto er nødvendig lokalt.

Terminal 2, fra repoets rot:

```powershell
cd MovieMate
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Sett `EXPO_PUBLIC_API_URL` i `MovieMate/.env` til backendens rotadresse, uten `/api`:

| Enhet | Adresse |
| --- | --- |
| Android-emulator | `http://10.0.2.2:5173` |
| iOS-simulator | `http://localhost:5173` |
| Fysisk telefon | `http://<PC-ens IPv4-adresse>:5173` |
| Android via USB | `adb reverse tcp:5173 tcp:5173`, deretter `http://localhost:5173` |

Finn IPv4 med `ipconfig`. Telefon og PC må kunne nå hverandre; skole-Wi-Fi kan blokkere dette. Bruk eventuelt hotspot. Tillat port 5173 på privat nettverk i brannmuren. Expo-tunnel gjør ikke backend tilgjengelig. Start Expo på nytt etter endring av `.env`. Registrer din egen bruker i appen; ingen passord eller testkonto er lagt i repoet.

Etter at `.env` er satt opp, logg inn på Expo fra samme terminal i `MovieMate/` og start appen:

```powershell
npx expo login --no-browser
npx expo whoami
npx expo start --go --clear
```

Skriv Expo-brukernavn/e-post og passord når terminalen spør. Passordet vises ikke mens du skriver. Installer Expo Go på telefonen og logg inn med samme Expo-konto som i terminalen. Skann QR-koden med Kamera på iPhone eller fra Expo Go på Android. La både backend-terminalen og Expo-terminalen stå åpne. MovieMate-kontoen opprettes inne i appen og er en annen konto enn Expo-kontoen. Se [mobilens steg-for-steg-veiledning](MovieMate/README.md) for full oppstart fra `MovieMate/`.

Native Android/iOS er leveranseplattformene. Nettleserpreview krever separat CORS/trusted-origin-oppsett i backend og er ikke en verifisert leveranse. Webpreview lagrer token bare i minnet. På mobil brukes SecureStore, og økten gjenopprettes ved oppstart.

## Hovedflyt

Opprett konto eller logg inn → søk under Oppdag → åpne en film → legg til i filmlisten → åpne Min filmliste → rediger status, vurdering, favoritt og kommentar. Lukk appen og åpne den igjen: token hentes fra SecureStore, brukeren valideres med `/api/me`, og listen hentes på nytt fra serveren. Utlogging forsøker å avslutte serversesjonen og fjerner token og cache på enheten også når nettet er borte.

## Struktur og valg

| Sted | Ansvar |
| --- | --- |
| `MovieMate/src/app/` | Expo Router: auth-stack, beskyttet app-stack, tre faner, film- og redigeringsruter |
| `MovieMate/src/api/` | HTTP, bearer-header, timeout, Zod-validering og API-feil |
| `MovieMate/src/contexts/AuthContext.tsx` | Bruker, gjenoppretting, innlogging og utlogging |
| `MovieMate/src/hooks/use-watchlist.ts` | TanStack Query og mutations som oppdaterer cache |
| `MovieMate/src/components/` | Felles native UI, innloggingsskjema og filmkort |
| `MovieMate/src/utils/` | Zod-skjemaer, typer og SecureStore |
| `MovieMate/src/__tests__/` | Enhet, komponent og hovedflyt med mocket API |
| `backend/src/features/` | Auth, filmoppslag og watchlist med eierskapssjekk |
| `backend/src/db/`, `backend/drizzle/` | Databaseskjema og migrasjoner |

Tre sentrale valg:

1. TanStack Query eier kopien av serverdata; AuthContext eier brukerøkten. Vi lager ikke en ekstra datacontext eller lokal filmdatabase. Mutations invaliderer watchlist slik at skjermen henter serverens resultat.
2. Mobilen sender bearer-token fra SecureStore. Navigasjonsguards beskytter brukerflyten; backendens bruker- og eierskapssjekker beskytter dataene. Cache fjernes ved bytte av bruker og utlogging.
3. Webappens mørke palett og lilla aksenter er gjenskapt med native komponenter. FlatList begrenser rendring av filmlister, antall filmkolonner følger skjermbredden, og skjemaene kan rulles når tastaturet er åpent. Favoritter er et filter på samme liste.

Lasting, feil med nytt forsøk, tom liste og data håndteres i listeskjermene. Ingen endring vises som lagret før serveren har svart. Vurdering må være et heltall 1–10 eller tom, kommentar maks 500 tegn. Filmsøk viser første side fra TMDB; paginering og offline-redigering inngår ikke.

## Backend og webappen

`backend/` er en selvstendig kopi av API-et fra [GruppeB03WebApp](https://github.com/lwkyabdi/GruppeB03WebApp), med tillegg for mobilklienten. Gjenbruk av kode betyr ikke delt database: lokal D1 her og lokal D1 i webrepoet er forskjellige databaser. For å dele kontoer og filmer må begge klientene bruke samme kjørende backend og D1-binding. Ingen produksjonsadresse er forhåndskonfigurert, og originalrepoet oppdateres ikke automatisk.

Filmsøket er endret fra `{ results }` til `{ ok: true, data }`, og populære filmer og filmdetaljer er eksponert som REST. Flytt disse backend-endringene til webserveren før mobilappen peker dit. Se [API.md](API.md) for kontrakt. TMDB-nøkkelen blir på serveren; plakatbilder lastes fra TMDBs bildevert.

## Kontroller

I `MovieMate/`:

```powershell
npm run lint
npm test
npx expo export --platform android --platform ios
```

I `backend/`:

```powershell
npm run lint
npm test
npm run build
```

Med lokal backend kjørende kan du i tillegg kjøre `npm run test:api` i `backend/`. Den tester ekte HTTP, D1 og TMDB, og krever en gyldig TMDB-token. Den oppretter to lokale testkontoer, fjerner filminnslaget og avslutter sesjonene etter testen.

Jest med jest-expo og Testing Library tester validering, filmkort med manglende plakat og trykk, samt innlogging → søk → legg til → vis liste → favoritt → omstart → utlogging. API-et og native lagring/navigasjon mockes; skjermene, auth-context og Query kjører sammen. Dette er en integrasjonstest av hovedflyten, ikke en E2E-test på telefon. Vitest tester blant annet backendens forretningsregler, eierskap og filmkontrakten. Se [LEVERING.md](LEVERING.md) for faktisk kontrollstatus og manuell enhetstest.

## Sikkerhet og begrensninger

`.env`, `.dev.vars`, lokal D1 og `node_modules` skal ikke i Git eller leveringszip. Alle `EXPO_PUBLIC_*`-verdier kan leses i appen. Bruk HTTPS ved publisering; HTTP-adressene over er til lokal utvikling. Vi bruker ikke kamera, lokasjon, betalingsdata eller roller. API-et validerer input, binder databaseverdier og sjekker eier av hver oppføring. Feil under gjenoppretting ved nettbrudd sletter ikke tokenet; brukeren kan prøve igjen. Ved utløpt sesjon vises innlogging på nytt. Utlogging uten nett kan ikke garantere serverrevokering, men fjerner lokal tilgang.

Glemt passord, e-postverifisering, administrasjon, pushvarsler, offline-synkronisering og appbutikkpublisering inngår ikke. Delt backend i produksjon og testing på fysiske enheter må bekreftes i deres miljø.

## Innlevering og KI

Se [LEVERING.md](LEVERING.md) for kravkartlegging, prioritert sluttkontroll, rapportunderlag og zip-kommando. [KI-LOGG.md](KI-LOGG.md) beskriver KI-bidrag med konkrete filer; [KI-avtale.md](KI-avtale.md) er gruppens eksisterende avtale. Gruppen må selv kvalitetssikre og kunne forklare koden, fylle inn faktiske navn og bidrag i rapporten og bekrefte gjennomførte muntlige arbeidskrav. Git-historikk skal beholdes.

Faglige oppslagskilder: [Expo SDK 58 SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/), [beskyttede ruter](https://docs.expo.dev/router/advanced/authentication/), [Jest med Expo](https://docs.expo.dev/develop/unit-testing/), [Better Auth bearer](https://better-auth.com/docs/plugins/bearer) og [trusted origins for native apper](https://better-auth.com/docs/integrations/expo#scheme-and-trusted-origins). Implementasjonen er i tillegg kontrollert mot de installerte pakkeversjonene.
