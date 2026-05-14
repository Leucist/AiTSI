# Super Coin Quest (AiTSI)

Super Coin Quest to platformówka 2D w postaci aplikacji webowej stworzonej przy pomocy Reacta i Vite. Gra posiada autorski silnik fizyki, efekty cząsteczkowe, wiele poziomów oraz system zapisu postępów zintegrowany z serwerem backendowym.

Projekt kładzie silny nacisk na testy automatyczne, pokrywające wszystko od kalkulacji fizyki aż po kompletne scenariusze użytkownika (end-to-end).

---

## Informacje o Środowisku i Wersje

Do uruchomienia i testowania projektu wymagane jest środowisko Node.js. Poniżej znajdują się kluczowe wersje użytych technologii (zgodnie z listą zależności):

- **Środowisko:** Node.js (zalecana wersja 20+)
- **Frontend Framework:** React 19.0.0
- **Narzędzie do budowania:** Vite 6.2.0
- **Backend:** Express 4.21.2, Node.js + TSX
- **Baza danych:** Better-SQLite3 12.4.1
- **Testy jednostkowe:** Vitest 4.0.18
- **Testy E2E / UI:** Playwright 1.58.2
- **Język:** TypeScript 5.8.2

---

## Uruchomienie Aplikacji

### 1. Instalacja Zależności

Zanim zaczniesz, upewnij się, że masz zainstalowanego Node.js. W głównym folderze projektu zainstaluj niezbędne pakiety za pomocą menedżera pakietów `npm`:

```bash
npm install
```

### 2. Uruchomienie w Trybie Deweloperskim

Aby uruchomić zarówno serwer backendowy (API + baza SQLite), jak i aplikację frontendową, wykonaj polecenie:

```bash
npm start
```

Domyślnie aplikacja będzie dostępna pod adresem:

- **Frontend (gra):** <http://localhost:3000>
- **Backend (API):** <http://localhost:3001>

---

## Uruchamianie Testów

Aplikacja jest kompleksowo testowana. Testy są podzielone na jednostkowe (Vitest) i End-to-End (Playwright).

### 1. Testy Jednostkowe (Vitest)

Służą do testowania odizolowanej logiki gry (fizyka, mechaniki, integralność danych) bez użycia przeglądarki. Mamy obecnie 90 testów jednostkowych.

Aby uruchomić wszystkie testy jednostkowe w terminalu, wpisz:

```bash
npm run test:unit
```

*(Opcjonalnie)* Aby uruchomić testy w trybie interfejsu przeglądarkowego:

```bash
npx vitest --ui
```

### 2. Testy UI / E2E (Playwright)

Otwierają one rzeczywistą przeglądarkę (Chromium), by przetestować interfejs i pełne scenariusze rozgrywki użytkownika. Projekt posiada 83 testy Playwright.

Aby uruchomić wszystkie testy Playwright w trybie domyślnym (**Headless** - bez pokazywania okna przeglądarki):

```bash
npm run test:e2e
```

Aby uruchomić poszczególne pakiety testów lub użyć trybu graficznego:

- **Wszystkie testy w trybie graficznym (Headed - okno przeglądarki z interfejsem testowym):** `npm run test:e2e:ui`
- **Tylko Smoke Testy (Headless):** `npx playwright test tests/app.spec.ts`

*Uwaga: Testy Playwright są celowo skonfigurowane na uruchamianie sekwencyjne (`workers: 1`), by zapobiec blokadom bazy danych SQLite podczas testowania operacji zapisu i odczytu.*

---

## Sterowanie w Grze

- **A / D** lub **Strzałki W Lewo / Prawo**: Poruszanie się postacią
- **W** lub **Strzałka W Górę** lub **Spacja**: Skok
- **Esc**: Otwarcie menu / Pauza
- **S** lub **Przycisk na HUD**: Zapis stanu gry
