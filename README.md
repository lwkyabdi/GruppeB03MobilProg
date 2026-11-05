# MovieMate – mobilprosjekt

Dette repoet inneholder både Expo-appen (`MovieMate/`) og RedwoodSDK-serveren
(`backend/`), kopiert fra gruppens GruppeB03WebApp. Det er nok å klone dette
repoet. API, innlogging, databasemigrasjoner og backend-tester er inkludert. Nettsidens grensesnitt er fjernet.
Endringer i det opprinnelige webrepoet synkroniseres ikke automatisk hit.

## Krav

- Node.js 22.13 eller nyere og npm 11 eller nyere.
- Android-emulator eller en fysisk telefon med en Expo-klient som støtter
  prosjektets Expo SDK 58. iOS-simulator krever macOS.
- TMDB Read Access Token for filmsøk og filmvisning.

Kommandoene nedenfor kjøres fra repoets rot i PowerShell. Hvis PowerShell
blokkerer `npm.ps1`, bruk `npm.cmd` i stedet for `npm` og `npx.cmd` for `npx`.

## 1. Installer og konfigurer backend

```powershell
cd backend
npm ci
Copy-Item .dev.vars.example .dev.vars
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Åpne `backend/.dev.vars`. Bruk den genererte verdien som `BETTER_AUTH_SECRET`,
behold `BETTER_AUTH_URL=http://localhost:5173` for lokal nettleserbruk, og fyll
inn `TMDB_READ_ACCESS_TOKEN`. Eksempelfilen inneholder ingen hemmeligheter.
Ikke overskriv en eksisterende `.dev.vars` hvis du allerede har konfigurert den.

```powershell
npm run migrate:dev
npm run dev -- --host 0.0.0.0
```

La terminalen kjøre. Åpne `http://localhost:5173/api/status`; den skal returnere
`{"status":"ok","version":"0.1.0"}`. Backend leverer bare API, ingen nettside. Registrering skjer gjennom `POST /api/auth/sign-up/email`.

Migrasjonene oppretter en tom lokal D1-database i `backend/.wrangler/`.
Cloudflare-konto og produksjonsdatabase er ikke nødvendig for lokal utvikling.
Ikke kjør produksjonsmigrasjoner for dette oppsettet. Lokale data og kontoer
følger ikke med når en annen person kloner repoet.

## 2. Installer og start mobilappen

Åpne en ny terminal fra repoets rot:

```powershell
cd MovieMate
npm ci
Copy-Item .env.example .env
npx expo start
```

Appen bruker Expo SDK 58. Behold prosjektets versjoner og den eksisterende
lockfilen inne i `MovieMate/`.


`MovieMate/.env` angir backendens rotadresse, uten `/api` eller `/api/v1`:

| Plattform | EXPO_PUBLIC_API_URL |
| --- | --- |
| Android-emulator | `http://10.0.2.2:5173` |
| Fysisk telefon | `http://<PC-ens lokale IPv4-adresse>:5173` |
| iOS-simulator på Mac | `http://localhost:5173` |

På fysisk telefon må PC og telefon kunne nå hverandre på nettverket, og lokal
brannmur må tillate backend-port 5173. Finn PC-ens adresse med `ipconfig`.
Expo-tunnel eksponerer ikke backend automatisk. Last appen på nytt etter
endring av `.env`.

## Status og neste steg

Dette oppsettet samler prosjektene i ett repo. Mobilskjermene er foreløpig ikke
koblet til backend; `.env` alene oppretter ingen API-integrasjon. Neste steg er
API-klient og AuthContext i mobilappen, deretter filmsøk og watchlist.

Eksisterende backend-endepunkter:

- `GET /api/status`
- `POST /api/auth/sign-up/email` og `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET /api/me` (krever sesjon)
- `GET /api/v1/movies?query=...`
- `GET/POST /api/v1/watchlist`
- `GET/PATCH/DELETE /api/v1/watchlist/:id`

Backend har allerede Better Auth bearer-plugin. Mobilintegrasjonen må sende
sesjonstoken og testes mot denne konfigurasjonen. Expo web på en annen origin
krever i tillegg eksplisitt CORS-oppsett; dette er ikke lagt til her.

## Kontroller

I `backend/`:

```powershell
npm run lint
npm test
```

I `MovieMate/`:

```powershell
npx tsc --noEmit
```

`.dev.vars`, `.env`, `node_modules` og lokal database skal aldri committes.
En eventuell `.dev.vars` i `MovieMate/` brukes ikke av Expo; backendens
hemmeligheter skal ligge i `backend/.dev.vars`.

## Expo Go og kontrollert oppstart

På fysisk iPhone må Expo CLI og Expo Go være logget inn med samme Expo-konto.
Bruk din egen konto, ikke gruppens passord:

```powershell
npx expo login --no-browser
npx expo start --clear
```

Brukeren har bekreftet at appen åpner i Expo Go på iPhone etter oppgradering
fra SDK 57 til SDK 58. Dette bekrefter oppstart, ikke at mobilens API-integrasjon
eller innlogging i MovieMate er ferdig. De nye rutekomponentene er plassholdere.

## KI-hjelp i dette oppsettet

Codex hjalp med å hente og tilpasse backend fra `lwkyabdi/GruppeB03WebApp`,
fjerne webgrensesnittet, lage miljøeksempler og denne oppstartsveiledningen.
Codex hjalp også med SDK 58-avhengigheter og lockfil i `MovieMate/`,
fanekomponenten, temahåndtering og standardeksportene i de tomme skjermrutene.
Backendens forretningslogikk og database er gjenbrukt fra webprosjektet.
