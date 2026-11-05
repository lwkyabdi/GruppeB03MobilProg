# MovieMate – start appen i Expo Go

MovieMate lar deg søke etter filmer og lagre en personlig filmliste med status, vurdering, kommentar og favoritter. Du trenger to terminaler: én for backend og én for Expo. Begge må stå åpne mens du bruker appen.

Kommandoene under er for PowerShell. Dersom Windows blokkerer `npm` eller `npx`, skriv `npm.cmd` og `npx.cmd` i stedet. Du trenger Node.js 22.13 eller nyere og Expo Go med støtte for prosjektets SDK 58.

## 0. På en ny maskin – hent prosjektet først

Installer Node.js (22.13 eller nyere), Git og VS Code på PC-en, og Expo Go på telefonen. Du trenger en egen Expo-konto og en TMDB Read Access Token til backend. Expo-innloggingen er forklart i steg 4.

Åpne PowerShell i mappen der du vil lagre prosjektet, og kjør én linje om gangen:

```powershell
git clone https://github.com/lwkyabdi/GruppeB03MobilProg.git
cd GruppeB03MobilProg
code .
```

Hvis `code .` ikke fungerer, åpner du mappen `GruppeB03MobilProg` via **File → Open Folder** i VS Code. Velg deretter **Terminal → New Terminal** og kjør:

```powershell
cd MovieMate
```

Du står nå i `MovieMate/` og kan følge steg 1. Miljøfilene `.env` og `.dev.vars` følger ikke med fra GitHub; du oppretter dem i stegene under. `npm ci` installerer pakkene fra lockfilen. Kommandoene med `if (!(Test-Path ...))` kopierer en eksempelfil bare hvis din lokale fil mangler.

## 1. Start backend – terminal 1

Hvis terminalen står i **denne mappen (`MovieMate/`)**, gå til backend:

```powershell
cd ../backend
npm ci
if (!(Test-Path .dev.vars)) { Copy-Item .dev.vars.example .dev.vars }
```

Ved første oppsett åpner du `backend/.dev.vars` og fyller inn:

```env
BETTER_AUTH_SECRET=din-genererte-hemmelighet
BETTER_AUTH_URL=http://localhost:5173
TMDB_READ_ACCESS_TOKEN=din-tmdb-read-access-token
```

Generer hemmeligheten med denne kommandoen og kopier resultatet til `BETTER_AUTH_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Hvis `.dev.vars` allerede er konfigurert, beholder du verdiene. Ikke del denne filen eller legg den i Git.

Fra **`backend/`**, start databasen og serveren:

```powershell
npm run migrate:dev
npm run dev -- --host 0.0.0.0
```

Åpne `http://localhost:5173/api/status` på PC-en. Du skal få et svar med `"status":"ok"`. La terminal 1 stå åpen.

## 2. Installer mobilappen – terminal 2

Åpne en ny terminal i **denne mappen (`MovieMate/`)**. Hvis den står i repoets rot, kjør først `cd MovieMate`.

Fra denne mappen:

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Kopieringen gjøres bare når `.env` ikke finnes, slik at en eksisterende adresse beholdes.

## 3. Sett riktig backend-adresse

For en fysisk telefon, kjør følgende i terminal 2:

```powershell
ipconfig
```

Finn **IPv4-adresse** under nettverket PC-en bruker, for eksempel Wi-Fi. Åpne **`MovieMate/.env`** og skriv inn PC-ens faktiske adresse:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.225:5173
```

`192.168.1.225` er bare et eksempel. **IP-adressen fylles ikke inn automatisk når du kopierer `.env.example`.** På en ny maskin må du selv finne adressen med `ipconfig` og skrive den inn i `.env`. Bruk adressen til PC-en som kjører backend. Ikke legg til `/api` på slutten.

| Du kjører appen på | Adresse i `.env` |
| --- | --- |
| Fysisk telefon | `http://<PC-ens IPv4-adresse>:5173` |
| Android-emulator | `http://10.0.2.2:5173` |
| iOS-simulator på Mac | `http://localhost:5173` |

Telefon og PC må kunne nå hverandre på samme nettverk. På telefonen åpner du `http://<PC-ens IPv4-adresse>:5173/api/status` i nettleseren. Når du ser `"status":"ok"`, er forbindelsen til backend i orden. Hvis adressen ikke åpnes, kontroller Wi-Fi og Windows-brannmuren. Skolens nettverk kan blokkere forbindelsen; bruk eventuelt hotspot.

## 4. Logg inn på Expo i terminalen

Fra **`MovieMate/`** i terminal 2:

```powershell
npx expo login --no-browser
```

Skriv inn **Expo-brukernavn/e-post og passord** når terminalen spør. Passordet vises ikke mens du skriver. Har du ingen Expo-konto, opprett en på [expo.dev](https://expo.dev/signup).

Kontroller hvilken konto du er logget inn med:

```powershell
npx expo whoami
```

Hvis feil konto vises, kjør `npx expo logout` og logg inn igjen.

## 5. Start Expo og åpne på telefonen

Fra **`MovieMate/`** i terminal 2:

```powershell
npx expo start --go --clear
```

Installer eller oppdater **Expo Go** på telefonen, og logg inn med **samme Expo-konto som i terminalen**. På fysisk iPhone kreves samme konto i Expo Go og Expo CLI; se [Expo-dokumentasjonen](https://docs.expo.dev/more/expo-cli/#authentication).

- **iPhone:** Skann QR-koden i terminalen med Kamera og åpne lenken i Expo Go.
- **Android:** Skann QR-koden fra Expo Go.
- **Android-emulator:** Start emulatoren og trykk `a` i Expo-terminalen.

Når MovieMate åpnes, velg **«Ny her? Opprett konto»**, eller logg inn med en eksisterende MovieMate-konto. Expo-kontoen brukes til å åpne prosjektet; MovieMate-kontoen brukes til din personlige filmliste.

En ny lokal backend har en ny, tom database. Opprett derfor en MovieMate-konto på nytt når du starter backend på en annen maskin. Kontoer og filmer fra den gamle PC-en følger bare med dersom dere bruker samme kjørende backend og database.

## Neste gang du vil starte

Hvis pakkene og miljøfilene allerede er på plass, trenger du bare følgende:

Terminal 1, fra **`backend/`**:

```powershell
npm run dev -- --host 0.0.0.0
```

Terminal 2, fra **`MovieMate/`**:

```powershell
npx expo whoami
npx expo start --go --clear
```

Logg inn med `npx expo login --no-browser` dersom du er utlogget. Kontroller `.env` på nytt hvis PC-ens IP-adresse har endret seg. Stopp serverne med `Ctrl+C` i hver terminal.

## Vanlige problemer

- **«Kan ikke nå serveren»:** Kontroller at backend kjører, og at telefonen kan åpne `/api/status` på adressen i `.env`. Expo-tunnel deler ikke backend automatisk.
- **Endret `.env`:** Stopp Expo med `Ctrl+C` og start igjen med `npx expo start --go --clear`.
- **Ulik Expo-konto:** Bruk `npx expo whoami` og sammenlign med kontoen i Expo Go.
- **SDK-versjon støttes ikke:** Expo Go må støtte SDK 58. Behold prosjektets avhengigheter og lockfil.
- **Feil i en gammel `hint-row.tsx`-fane:** Denne ubrukte malfilen og dens gamle temakomponenter er fjernet. Lukk fanen uten å lagre den tilbake. Kjør **TypeScript: Restart TS Server** fra kommandopaletten (`Ctrl+Shift+P`). Hvis feilen fortsatt vises, kjør **Developer: Reload Window**.

## Tester og kodeoversikt

Fra **`MovieMate/`**:

```powershell
npm run lint
npm test
npx expo export --platform android --platform ios
```

Rutene ligger i `src/app`, API-klienten i `src/api`, auth i `src/contexts`, Query-hooks i `src/hooks`, felles komponenter i `src/components`, og skjemaer og SecureStore i `src/utils`.

Se [repoets README](../README.md) for arkitektur og begrensninger, og [LEVERING.md](../LEVERING.md) for kravkartlegging og manuell testliste. Native Android/iOS er leveranseplattformene; nettleserpreview krever separat CORS-oppsett.
