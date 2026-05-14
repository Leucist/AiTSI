# Specyfikacja Przypadków Testowych (Test Cases)

## Lista Wymagań

| ID Wymagania | Opis Wymagania |
| :--- | :--- |
| **R1** | Aplikacja powinna umożliwiać postaci gracza poruszanie się w lewo i w prawo. |
| **R2** | Aplikacja powinna umożliwiać wykonanie skoku, gdy postać znajduje się na stałym podłożu. |
| **R3** | Silnik fizyki powinien ściągać postać w dół (grawitacja) oraz blokować ruch przez obiekty (platformy). |
| **R4** | Zbliżenie się do monety skutkuje jej zebraniem i dodaniem 10 punktów do głównego wyniku gracza. |
| **R5** | Dotknięcie drzwi wyjściowych poziomu skutkuje załadowaniem kolejnego etapu. |
| **R6** | Wypadnięcie postaci poza dolną krawędź planszy kończy się statusem Game Over. |
| **R7** | Aplikacja powinna zawierać interfejs HUD wyświetlający aktualny wynik, wyczyszczone monety oraz poziom. |
| **R8** | Gra powinna umożliwić zapis swojego stanu za pośrednictwem serwera Backendowego (REST API). |
| **R9** | Wczytanie gry po odświeżeniu witryny powinno odtworzyć progres gracza na podstawie zapisanych danych z Backend API. |
| **R10**| Menu główne oraz nakładki (Pause, Game Over, Win) muszą odpowiednio zarządzać pętlą gry i być zawsze czytelne. |

## Tabela Przypadków Testowych

| ID | Input / Warunek Wejściowy | Warunki wejścia (Preconditions) | Oczekiwany rezultat | Warunki wyjścia (Postconditions) | Wymaganie |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC1 | Wciśnięcie strzałki w prawo / `D` | Gracz na planszy, gra aktywna | Postać przemieszcza się w prawo, odwraca teksturę w prawo. | Pozycja $X$ gracza jest większa. | R1 |
| TC2 | Wciśnięcie strzałki w lewo / `A` | Gracz na planszy, gra aktywna | Postać przemieszcza się w lewo, odwraca teksturę w lewo. | Pozycja $X$ gracza jest mniejsza. | R1 |
| TC3 | Brak wciśniętego klawisza po ruchu | Postać poruszała się na podłożu | Postać wyhamowuje z powodu tarcia do zera. | Prędkość $X$ wynosi 0. | R1 |
| TC4 | Wciśnięcie strzałki w górę / `W` / `Space` | Postać stoi na podłożu (`grounded=true`) | Postać wykonuje skok w górę. | Prędkość $Y$ otrzymuje ujemną wartość. | R2 |
| TC5 | Wciśnięcie skoku podczas spadania | Postać znajduje się w powietrzu (`grounded=false`) | Komenda skoku zostaje zignorowana. | Prędkość $Y$ nie zmienia się w skutek skoku. | R2 |
| TC6 | Postać ląduje na platformie | Postać opada w stronę platformy | Następuje kolizja z platformą od góry i zatrzymanie opadania. | `grounded=true`, prędkość $Y$ jest 0. | R3 |
| TC7 | Uderzenie w spód platformy podczas skoku | Postać skacze pod platformą | Następuje odbicie od sufitu i utrata prędkości pionowej w górę. | Prędkość $Y$ wyzerowana (zaczyna opadać). | R3 |
| TC8 | Postać wchodzi w ścianę od boku | Ruch w kierunku pionowej ściany bloku | Zablokowanie przenikania przez bryłę platformy w poziomie. | Pozycja $X$ dopasowana do krawędzi bloku. | R3 |
| TC9 | Kolizja postaci z czerwoną monetą na osiach X,Y | Gracz porusza się obok monety (odległość < `25px`) | Moneta zdefiniowana jako zabrana, wywołany event zebrania. | Moneta znika z widoku poziomu. | R4 |
| TC10 | Ponowna kolizja z pozycją już zebranej monety | Gracz przechodzi przez miejsce, z którego zabrano monetę | Zdarzenie ignorowane ze względu na użycie Set (Set.has). | Licznik punktów nie inkrementuje się. | R4 |
| TC11 | Kolizja z więcej niż 1 monetą jednocześnie | Skupisko monet znajduje się obok gracza w 1 kroku | System przyznaje poprawny mnożnik 10x per moneta. | Znikają wszystkie zebrane w promieniu monety.| R4 |
| TC12 | Gracz omija monetę o więcej niż 25px | Postać omija monetę i nie znajduje się wystarczająco blisko | Zdarzenie pobrania nie aktywuje się. | Moneta dalej wyrenderowana, punkty 0. | R4 |
| TC13 | Dojście do brązowych drzwi (zasięg < 30px) | Postać na końcu etapu obok drzwi | Zdarzenie `Level Complete` uaktywnia się. | Pętla poziomu 1 kończy się. | R5 |
| TC14 | Postać znajduje się na lewym krańcu ekranu ($X < 0$) | Postać porusza się w lewo na pozycję ujemną | Blokada opuszczenia lewej krawędzi sceny (Boundary). | Prędkość $X$ zerowana przy skrajnym końcu. | R3 |
| TC15 | Postać na prawym krańcu ekranu ($X > map.width$) | Postać porusza się poza renderowaną scenę w prawo | Blokada kamery lub zderzenie z fizycznym limitem prawej granicy. | Postać nie wychodzi z kadru gry. | R3 |
| TC16 | Postać opada poniżej planszy ($Y > map.height + 100$) | Gracz wykonuje zły skok w przepaść | Opadanie kończy się po progu wysokości wyzwoleniem śmierci. | Status gry to "game over", gra wstrzymana. | R6 |
| TC17 | Widok HUD podczas aktywnej gry | Wystartowano z ekranu "New Adventure" | Licznik punktów i monet renderowany jest stale na górze ekranu. | Wynik gracza wynosi bazowo 0. | R7 |
| TC18 | Zebranie 3 monet aktualizuje HUD | Gra aktywna, 3x zebrane przedmioty. | Wskaźnik punktów zmienia wynik wizualny w bieżącej klatce animacji do "30". | Elementy DOM HUDu zaktualizowane do 30. | R7 |
| TC19 | Ekran Start Screen przed pierwszą sesją | Wejście na `localhost:3000` (brak w `localStorage`) | Ekran tytułowy widoczny, przycisk `Continue` ukryty. | Wyświetlony przycisk "New Adventure". | R10 |
| TC20 | Kliknięcie Save z Pause Menu | Gra spauzowana (`Esc`), użytkownik ma punkty i poziom | Żądanie POST (`/api/save`) idzie do serwera, stan trafia do LocalStorage. | Dane zapisane w JSON, serwer zwraca kod `2xx`. | R8 |
| TC21 | Odpalenie aplikacji i wczytanie przycisku `Continue` | Istnieje zapis na serwerze API (`/api/load`) lub localStorage. | Gra umożliwia kontynuację zapisu przyciskiem "Continue Journey". | Przycisk wznawiający widoczny dla usera. | R9 |
| TC22 | Wznowienie rozgrywki przez API | Kliknięcie `Continue Journey` przy starcie | Gra ładuje poprawny "Level", poprawną ilość punktów zebranych do HUDu. | Postać zrespi się na `start.x`/`y` wg poziomu.| R9 |
| TC23 | Odczyt brakującego/niepoprawnego tokena API `401` | System zgłasza nieautoryzowany test request podczas API Load | Fallback: gra spróbuje odczytać postęp z użyciem `localStorage` gry. | Kod 401 przyjęty pomyślnie, użyty local. | R9 |
| TC24 | Reakcja na `ESC` podczas grania | Rozgrywka w toku | Menu Nakładki Pause Screen renderuje się i wymusza zwieszenie silnika (pętli). | Gra wstrzymana całkowicie. | R10 |
| TC25 | Wznowienie przyciskiem "Resume" | Nakładka "Pause" aktywna | Pętla wraca do stanu running. Menu Pause ukrywa się całkowicie z `display:none`. | Gra znów grywalna. | R10 |
| TC26 | Zakończenie ostatniego Levelu | Gracz przeszedł ostatnie możliwe drzwi ze wszystkich leveli. | Nakładka "Win Overlay" z gratulacjami, wynikiem punktowym, reset stanu. | Pojawia się przycisk "Main Menu". | R10 |
| TC27 | Użycie przycisku "Try Again" po zgonie. | Postać wylądowała w przepaści, pojawiło się "Game Over". | Gra przeładowuje parametry gracza, ustawia ten sam poziom od nowa, punkty do 0. | Postać na starcie, stan punktów: `0`. | R6 |
| TC28 | Próba załadowania odciętego serwera (/api/save) | Wyłączony Backend, próba manualnego Save | Gra łapie wyjście catch w obietnicy, wypisuje `console.error` z błędem, ale zapisuje w LocalStorage. | Gra nadal działa stabilnie. | R8 |
| TC29 | Start z nieobsługiwanym ID levelu `(-1)` w localstorage. | Manipulacja zawartości localStorage przez hackowanie konsoli u klienta | Walidator po załadowaniu weryfikuje zakres od `0` do limitu poziomów. | Odrzucenie load, start od lvl 0. | R9 |
| TC30 | Konsekwentna punktacja po śmierci | Zdobyto 30pkt, spadek w przepaść po restarcie zebranie 1 monety. | Zgromadzone punkty giną po śmierci, nowe podejście = od 0. Wynik powinien = 10. | Aktualny wynik to 10pkt. | R4 |

---

## Szczegółowy Przypadek Testowy Manualny (E2E)

**ID:** TC_MANUAL_E2E_001
**Tytuł:** Pełny, stabilny cykl ukończenia 1 poziomu wraz z poprawnym zapisaniem logiki gry na serwerze API (Save/Load Cycle).
**Wymagania:** R1, R2, R3, R4, R5, R7, R8, R9, R10

### 1. Warunki wejścia (Preconditions)
*   Użytkownik posiada uruchomiony zarówno Backend (`npm run start` - na portach 3000 i 3001) ze świeżą instancją bazy SQLite.
*   Brak cache'u przeglądarki i wyczyszczone `localStorage` (żadne klucze `super-coin-quest-save` nie istnieją).
*   Użytkownik otwiera aplikację na `http://localhost:3000`.

### 2. Akcje do wykonania (Kroki E2E)
1.  Na Ekranie Startowym użytkownik sprawdza, że przycisk "Continue Journey" NIE JEST widoczny, i klika przycisk **"New Adventure"**.
2.  HUD powinien od razu się pojawić w lewym górnym rogu z "Score: 0", "STAGE: 1".
3.  Użytkownik wciska oraz przytrzymuje przycisk **D** lub **Prawą Strzałkę** na klawiaturze – postać musi ruszyć w prawą stronę.
4.  W momencie napotkania przeszkody terenowej (platformy), użytkownik wciska klawisz **W** (lub **Spację**) z intencją przeskoczenia blokady.
5.  Gracz prowadzi postać i przecina się z co najmniej 1 szt. żółto-czerwonej kręcącej się monety.
    *   **Wynik kroku 5:** Licznik HUD "Score: " musi zaktualizować się natychmiast o $+10$ pkt na sztukę.
6.  Gracz wciska przycisk **ESC** by włączyć "Pause Menu". Wciska z menu niebieski przycisk "**Save Game**".
    *   **Wynik kroku 6:** System musi wysłać POST `/api/save` w tle bez zakłócania pauzy.
7.  Gracz wciska przycisk **"Resume"** z "Pause Menu" kontynuując grę.
8.  Gracz dąży w prawo do końca poziomu – wpada postacią na ikonę drewnianych Drzwi i w nie uderza.
    *   **Wynik kroku 8:** Skrypt weryfikuje uderzenie, generuje biały interfejs przejścia z napisem "Level Complete".
9.  Użytkownik odświeża kartę przeglądarki z wciśnięciem F5, porzucając rozpoczęty w ten sposób w tle Poziom nr 2.
10. System wita gracza ponownie z "Start Screen". Oczekiwane zachowanie to widoczny przycisk **"Continue Journey"**. Użytkownik go naciska.

### 3. Oczekiwane rezultaty
*   Gra reaguje płynnie na kontrolery fizyki od samej inicjalizacji.
*   Zbieranie punktów jest transparentne i aktualizowane reaktywnie.
*   Po kliknięciu zapisu i odświeżeniu, gra komunikuje się na starcie z włączonym API `/api/load` lub `localStorage`, stwierdzając obecność zapisu.
*   Po powrocie ("Continue Journey"), interfejs HUD znów informuje o ilości punktów zdobytej podczas Levelu 1 przed kliknięciem Save. System wznawia do Poziomu 2, a nie od nowa. 

### 4. Warunki wyjścia (Postconditions)
*   Wewnątrz `localStorage` znajduje się klucz JSON `super-coin-quest-save`.
*   W pliku lokalnym serwera na dysku `game.db` (SQLite) wygenerowano wpis save dla usera uzywajacego tokenu, przetrzymujac wartosci poziomu `1` i zdobytego `score`.
*   Aplikacja działa i w trybie Playing Level 2.
