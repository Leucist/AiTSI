# Sprawozdanie Końcowe – Super Coin Quest (AiTSI)

Niniejszy dokument stanowi kompletne sprawozdanie końcowe z przebiegu realizacji projektu z przedmiotu Automatyzacja i Testowanie Systemów Informatycznych (AiTSI). Aplikacja "Super Coin Quest" przeszła przez pełen rygorystyczny proces zapewnienia jakości (QA), co zaowocowało stabilnym i zoptymalizowanym systemem.

## 1. Strategia Testowania

W projekcie przyjęto strategię warstwową (Test Pyramid):
- **Testy Jednostkowe (Unit Tests)**: Weryfikacja kluczowych, odizolowanych elementów logiki – silnika fizyki (np. grawitacja, kolizje z platformami), mechanizmów zbierania monet, oraz walidatorów bazy danych. Szybkie w wykonaniu (Vitest), zapewniają fundamentalne bezpieczeństwo działania mechaniki bez ingerencji w UI.
- **Testy End-to-End (E2E)**: Użycie narzędzia Playwright do symulacji prawdziwej przeglądarki i operacji użytkownika. Każde z kluczowych Wymagań (R1-R10) otrzymało bezpośrednie pokrycie we frameworku E2E.
- **Izolacja Frontendu (Mockowanie)**: Zastosowano `page.route` w środowisku Playwright do niezależnego testowania zachowania aplikacji klienckiej bez użycia prawdziwego backendu. Wykorzystano mocki 500/503 by sprawdzić reakcję na awarię sieci oraz zafałszowane pakiety JSON symulujące specyficzne scenariusze rozgrywki (np. odgórne zaliczanie punktów).
- **Zarządzanie Stanem Uwierzytelnienia (State Management)**: Ograniczono redundantne operacje w testach (np. przechodzenie poziomów wielokrotnie) wstrzykując globalny kontekst sesji (`storageState` z Playwright). Pozwoliło to na wchodzenie w określone stany gry natychmiast po uruchomieniu testu, oszczędzając zasoby obliczeniowe.
- **Testowanie Zabezpieczeń (SCA)**: Wygenerowano listę SBOM przy pomocy CycloneDX oraz odszukano podatności zależności stosując mechanizmy statycznej analizy.

## 2. Harmonogram Prac

Realizacja projektu oparta była na metodologii iteracyjnej:
1. **Etap I - Baza**: Zbudowanie środowiska Vite/React, utworzenie repozytorium GitHub, implementacja podstawowego silnika gry (pętla, rendering, fizyka).
2. **Etap II - Jednostki**: Napisanie 60 testów jednostkowych w Vitest sprawdzających graniczne przypadki działania silnika 2D (np. przenikanie przez obiekty, wskaźniki grawitacji).
3. **Etap III - E2E & Backend**: Zbudowanie serwera Express/SQLite w celu gromadzenia stanu gry. Napisanie dymnych testów (Smoke) oraz pierwszych paczek E2E (UI).
4. **Etap IV - Specyfikacja**: Wyciągnięcie funkcjonalności przed zdefiniowane w tabelach Wymagania oraz przypisanie test case'ów do odpowiednich etykiet w Playwright (identyfikacja luk).
5. **Etap V - Optymalizacja i Bezpieczeństwo**: Wdrożenie mockowania tras dla E2E, implementacja `storageState`, aktualizacja zależności pod kątem podatności wykazanych w SBOM, wygenerowanie ostatecznych raportów i skryptów (np. `generate_report.py`).

## 3. Baza Przypadków Testowych
Szczegółowa, kompletna baza minimum 30 przypadków testowych oraz opisowego, manualnego scenariusza znajduje się w oddzielnym pliku dokumentacji z uwagi na rozmiar tabel:
👉 **[Zobacz Specyfikację Przypadków Testowych](TESTING_DOCUMENTATION.md)**

## 4. Analiza Automatyzacji

Automatyzacja, zarówno po stronie CI/CD, jak i bezpośredniego testowania, przyniosła projektowi wymierne korzyści:
- **Zwiększenie pewności wdrażania**: 60 testów Unit i kilkadziesiąt E2E wykonujących się w poniżej minutę pozwoliło na śmiałą refaktoryzację mechanik bez obawy o regresję.
- **Wczesne wykrywanie błędów po stronie API**: Testowanie kontraktów za pomocą fixture'a `request` upewniło zespół, że interfejs REST pomiędzy grą a bazą danych SQLite jest stabilny, bez ręcznego odpytywania Postmanem.
- **Znaczna poprawa czasu testów złożonych**: Użycie `storageState` pozwoliło zredukować czas trwania niektórych testów zaawansowanych poziomów z ~15s (symulowane przechodzenie 2 stref) do zaledwie `1-2ms` czystego wykonania asercji na zdefiniowanym stanie.
- **Monitoring Zależności**: Mechanizmy Software Composition Analysis udowodniły, że pozornie stabilna gra przeglądarkowa może dziedziczyć błędy klasyfikacji DoS (np. ReDoS w picomatch/path-to-regexp), co stanowi ogromną zaletę automatyzacji polityk bezpieczeństwa już w fazie deweloperskiej.
