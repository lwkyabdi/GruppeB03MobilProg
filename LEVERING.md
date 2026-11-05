# Leveringsstatus – MovieMate B03

## Utgangspunkt, plan og faktisk kode

Gjennomgangen bygger på begge vedlagte tekstene, mobilrepoet og webrepoet hentet 5. november 2026. Kurskravene i den vedlagte emnesiden er vurderingsgrunnlaget; den opprinnelige seks timers planen er et forslag til arbeid, ikke dokumentasjon på ferdig funksjonalitet.

| Tema | Før gjennomgangen | Planlagt i vedlegget | Implementert nå |
| --- | --- | --- | --- |
| Mobilgrensesnitt | Hardkodede filmkort, eksempelkomponenter og plassholdere | Native søk, liste og profil | Tre faner, film- og redigeringsskjerm, webappens mørke palett |
| Innlogging | Backend hadde Better Auth; mobilen var ikke koblet til | Bearer, SecureStore, auth-context og guards | Registrering, innlogging, gjenoppretting, utlogging og beskyttet stack |
| Filmdata | TMDB-service i backend, søk med `{ results }` | Felles API-kontrakt og søk | `{ ok, data }`, validerte søk, populære filmer og detaljer |
| Watchlist | Backend hadde CRUD, D1 og eierskapssjekker | Lese, legge til, endre, slette | Hele flyten, tre statuser, vurdering, kommentar og favorittfilter |
| Lagring | Lokal D1 i inkludert backend | Samme backend som webappen | Native token i SecureStore; filmdata i valgt backend. Felles produksjonsdatabase er ikke satt opp |
| Skjermstøtte | Portrett låst | Portrett og landskap | Fri orientering, fleksibel layout og 1–4 filmkolonner |
| Tester | Ingen mobiltester; backendtester fantes | Jest/jest-expo og Testing Library | Enhet, komponent, API-klient og hovedflyt; utvidede backendtester |

Backend i dette repoet er en kopi av webprosjektet, ikke en automatisk kobling til webappens database. Begge klientene kan bruke samme server, men dere må velge og bekrefte den serveren. Endringer i dette repoet er ikke publisert til webrepoet.

## Kravkartlegging

| Teknisk minstekrav i faget | Hvor det dekkes | Kontroll |
| --- | --- | --- |
| Expo, React Native, TypeScript | `MovieMate/package.json`, `src` | Typekontroll og native bundle-eksport |
| Stack og tabs/drawer | `src/app/_layout.tsx`, `(app)/_layout.tsx`, `(tabs)/_layout.tsx` | Native bundle; fysisk navigasjonsdemo gjenstår |
| Lagring etter lukking | D1 og SecureStore | Ekte API-lagring og mocket oppstartstest; fysisk omstart gjenstår |
| Ekstern kilde, lasting og feil | TMDB via backend, API-klient og listeskjermer | Ekte TMDB-kall og feilhåndtering i tester |
| Lese og skrive | Query, mutations og REST CRUD | Ekte API-test og hovedflyttest |
| FlatList og controlled inputs | Oppdag, filmliste, AuthForm og EditForm | Komponent-/integrasjonstester og Zod-enhetstester |
| Auth-context, SecureStore, guards | AuthContext og Stack.Protected | Token-header, revokering og eierskap testet mot server |
| Portrett, landskap og flere størrelser | `orientation: default`, `useWindowDimensions`, ScrollView | Implementert; fysisk kontroll kreves |
| Hovedflyt | Innlogging → søk → legg til → liste | Automatisert med mocket API og separat ekte API-test |
| Testbredde | `src/__tests__`, Jest/jest-expo og Testing Library | Enhet, komponent og hovedflyt |
| README og KI-logg | Rotens README, API.md og KI-LOGG.md | Skrevet med oppstart, struktur, valg og begrensninger |

## Gjennomførte kontroller 5. november 2026

- Mobilens TypeScript-kontroll (`npm run lint`) består.
- Mobilens 15 Jest-tester fordelt på fire testfiler består.
- Backend: TypeScript og 39 Vitest-tester består.
- Expo-eksport av Android- og iOS-bundler er gjennomført. Dette er ingen installert APK/IPA eller fysisk enhetstest.
- Backendens produksjonsbygg er gjennomført. Wrangler ga en lokal sandbox-advarsel om loggplassering; bygget fullførte. Lokal server ble startet med nødvendige filrettigheter og migrasjoner var allerede anvendt.
- Ekte HTTP-test (`cd backend; npm run test:api`) består: registrering, innlogging, token-header, `/api/me`, CRUD, ugyldig rating, annen brukers avviste endring, eget tomt resultat, søk, populære filmer, detaljer og avvist token etter utlogging.
- HTTP-testen oppretter to lokale kontoer med tilfeldig passord og fjerner filminnslaget og sesjonene. Ingen legitimasjon logges. Kontoene blir igjen i lokal D1, som ikke følger leveransen.

## Prioritert sluttkontroll for gruppen

1. **Test den fysiske leveransen.** Start etter README på en annen maskin. Opprett bruker, søk, legg til, sett vurdering og favoritt, slett og logg ut. Test portrett/landskap, liten skjerm og tastatur. Lukk helt og åpne igjen. Stopp backend og prøv søk/lagring; feil skal vises, og ulagrede endringer skal ikke fremstå som lagret.
2. **Velg backend i demonstrasjonen.** Den inkluderte serveren er klar for lokal kjøring. Hvis dere skal vise deling med webappen, flytt mobiltilleggene til den felles backend og pek begge klientene dit. Bekreft samme konto og oppføring fra begge klienter.
3. **Fullfør gruppens dokumentasjon.** Bruk rapportutkastet som underlag, fyll faktiske bidrag og navn, kontroller KI-avtalen og legg ved autentiske sign-off-skisser og arbeidsfordeling. Rapporten skal være tre sider ±10 %, ferdig eksportert til PDF.
4. **Pakk og lever fryst versjon.** Kontroller public GitHub-repo, rapport med repolenke, zip med `.git` uten `node_modules`, alle navn og gruppenavn i Canvas innen 5. november kl. 23:59. Ikke endre historie eller tilbakedater commits. Muntlige krav og presentasjon må bekreftes av gruppen, ikke av kodeverktøyet.

## Manuell testprotokoll

Fyll dato, enhet og faktisk resultat etter prøving. Rutene og oppførselen er implementert; tomme felt her betyr ikke gjennomført test.

| Sjekk | Enhet/dato | Resultat |
| --- | --- | --- |
| Ren klone og start etter README | Fyll inn | Fyll inn |
| Registrer, logg ut og logg inn igjen | Fyll inn | Fyll inn |
| Feil per felt, feil passord og duplikatkonto | Fyll inn | Fyll inn |
| Søk, åpne detaljer, legg til og se listen | Fyll inn | Fyll inn |
| Status, favorittfilter, vurdering og kommentar lagres | Fyll inn | Fyll inn |
| Slett: avbryt og bekreft | Fyll inn | Fyll inn |
| Lukk appen helt; konto og liste gjenopprettes | Fyll inn | Fyll inn |
| Portrett/landskap, tastatur og stor tekst | Fyll inn | Fyll inn |
| Nettbrudd, tomt søkeresultat og utløpt token | Fyll inn | Fyll inn |
| To kontoer ser bare egne filmer | Fyll inn | Fyll inn |

## Planlegging og skisser

Avgrensning: ingen roller, kamera, sosiale funksjoner, offline-skriving eller egen lokal filmdatabase. Dette følger prosjektets kjerne og mobilfagets minstekrav. Følgende er dokumentasjon av implementert flyt, laget ved ferdigstillingen; det erstatter ikke originale skisser fra uke 40:

```text
Innlogging / registrering
          ↓
Oppdag ───────── Min filmliste ───────── Profil
  ↓                   ↓                   ↓
Filmdetaljer       Rediger film          Logg ut
  ↓               status / 1–10
Legg til          favoritt / kommentar
  ↓                   ↓
Filmliste         Lagre / slett
```

Auth bruker `/api/auth/*` og `/api/me`. Oppdag og filmdetaljer bruker `/api/v1/movies*`. Filmlisten bruker GET/POST/PATCH/DELETE på `/api/v1/watchlist*`. Native skjemaer deler Field/Button, og alle nettverkskall går gjennom API-klienten.

## Rapport og muntlige arbeidskrav

[RAPPORT-UTKAST.md](RAPPORT-UTKAST.md) gir et faglig underlag. Det må bearbeides av gruppen. Følgende kan ikke bekreftes fra kode: hvem som har gjort hva utover Git-historikken, sign-off i uke 40, lyntaler, retrospekt, læringsutbytte og den enkeltes forståelse. Eksisterende Git-historikk viste åtte commits fra `lwky` og fire fra `trymellingsen` før denne arbeidsøkten; dette er ikke en fullstendig arbeidsfordeling.

Presentasjonen 12. november er 15 minutter: 1 min innledning, 3 min demo, 5 min kodevalg, 1,5 min KI, 1 min refleksjon, resten spørsmål og liten kodeendring. Øv med innlogget bruker og data klare. Vis spesielt AuthContext, Query-invalidering og forskjellen mellom navigasjonsguard og serverens eierskapssjekk.

## Lag leveringszip

Fra rotmappen i PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-delivery.ps1
```

Scriptet lager en ny datert zip under `levering/`, inkluderer gjeldende arbeidsfiler og `.git`, og utelater avhengigheter, bygg, lokal database, editorcache og lokale miljøfiler. Det endrer ikke Git-historikken. Zip må lages på nytt etter gruppens siste dokumentendringer. Pakkescriptet erstatter ikke kontroll av at rapport-PDF og Canvas-innleveringen er komplette.
