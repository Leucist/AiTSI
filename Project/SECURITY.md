# Analiza Bezpieczeństwa Zależności i Podatności (SCA)

Na potrzeby weryfikacji łańcucha dostaw oprogramowania wygenerowano plik Software Bill of Materials (SBOM) korzystając ze standardu CycloneDX, używając polecenia `npx @cyclonedx/cyclonedx-npm`. Dodatkowo, na podstawie zdefiniowanych zależności przeanalizowano repozytorium pod kątem znanych podatności używając skanera `npm audit` (zbliżonego do narzędzi takich jak Grype, Syft czy Aikido).

Poniżej znajduje się lista 3 zidentyfikowanych podatności o wysokim (High) poziomie zagrożenia wraz z propozycjami ich usunięcia.

---

## Zidentyfikowane Podatności

### 1. Vite: Arbitrary File Read / Path Traversal
* **Pakiet**: `vite` (v6.2.0)
* **Zagrożenie**: High (Wysokie)
* **Identyfikator**: GHSA-p9ff-h696-f583 / GHSA-4w7w-66w2-5vf9
* **Opis**: Podatność w narzędziu deweloperskim Vite polega na możliwości odczytu arbitralnych plików poprzez Dev Server WebSocket oraz lukę typu Path Traversal przy przetwarzaniu map optymalizowanych modułów (`.map`). Atakujący może odczytać wrażliwe pliki poza katalogiem serwera, co zagraża środowiskom programistycznym uruchomionym w trybie ekspozycji lokalnej/zdalnej.
* **Propozycja usunięcia**: Aktualizacja pakietu `vite` do wersji pozbawionej podatności (`> 6.4.1`), np. wykonując polecenie `npm audit fix` lub manualnie podbijając wersję w sekcji `devDependencies` w `package.json` z uruchomieniem `npm install`.

### 2. Path-to-RegExp: Regular Expression Denial of Service (ReDoS)
* **Pakiet**: `path-to-regexp` (zależność pośrednia)
* **Zagrożenie**: High (Wysokie)
* **Identyfikator**: GHSA-37ch-88jc-xwx2 (CWE-1333)
* **Opis**: Pakiet jest podatny na atak ReDoS poprzez wstrzyknięcie spreparowanych adresów i parametrów routingu, które zmuszają wyrażenia regularne do wyliczania logarytmicznie złożonych wyników. Może to spowodować zablokowanie Event Loop'a w Node.js, skutkując wyczerpaniem zasobów (Denial of Service) dla wszystkich klientów Express/Vite.
* **Propozycja usunięcia**: Wymuszona aktualizacja poddrzewa zależności (dependency resolution) korzystająca ze zgodnych i zabezpieczonych paczek (np. >= 0.1.13 dla starszych branchy). Sposobem naprawy jest wywołanie `npm update path-to-regexp` lub `npm audit fix`.

### 3. Picomatch: ReDoS oraz Method Injection
* **Pakiet**: `picomatch` (zależność pośrednia)
* **Zagrożenie**: High (Wysokie)
* **Identyfikator**: GHSA-c2c7-rcm5-vvqj / GHSA-3v7f-55p6-f55p
* **Opis**: Narzędzie analizujące dopasowywanie (glob matching) plików w środowisku Node zawiera lukę w obsłudze klas znaków POSIX oraz rozszerzonych kwantyfikatorów (`extglob`). Podobnie jak przy `path-to-regexp` prowadzi to do wyczerpania Event Loop'a poprzez powolne dopasowywanie spreparowanych ścieżek wejściowych.
* **Propozycja usunięcia**: Załatanie wersji pakietu `picomatch` do wariantu omijającego wektory wstrzyknięcia (`>= 4.0.4`). Usunięcie podatności następuje automatycznie po użyciu oficjalnego wbudowanego deweloperskiego narzędzia rozwiązywania audytów: `npm audit fix`.

---

## Załączniki
* Wygenerowany pełny wyciąg drzewa pakietów zapisano w głównym katalogu projektu w pliku `sbom.json` (w formacie JSON). 
* Zrzut logów audytu podatnościowy wygenerowany do pliku `audit.json`.
