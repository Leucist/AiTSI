# Plan wdrożenia – Modelowanie DDD i Model C4 (Super Coin Quest)

Ten dokument zawiera plan realizacji Pracowni 08 pod kątem analizy architektury gry "Super Coin Quest", dekonstrukcji długu technologicznego ("Wielka Kula Błota"), identyfikacji subdomen DDD, projektowania Bounded Contexts z Ubiquitous Language oraz wizualizacji As-Is vs To-Be w Modelu C4.

## Cel raportu
Stworzenie kompleksowego i zaawansowanego sprawozdania akademickiego w języku polskim o wysokiej estetyce, zawierającego szczegółową dekonstrukcję architektoniczną systemu, diagramy Mermaid dla DDD i C4, oraz konstruktywne propozycje refaktoryzacji, które przeniosą system z poziomu monolitycznego "Big Ball of Mud" do czystej, zorientowanej domenowo architektury.

## Proponowana lokalizacja raportu w projekcie
Stworzymy dedykowany, obszerny i profesjonalnie sformatowany dokument bezpośrednio w folderze projektu:
👉 `c:\Users\kolyas\Desktop\aitsl\AiTSI\Project\DEKONSTRUKCJA_PROJEKTU.md`

Również stworzymy plan wdrożenia, listę zadań oraz podsumowanie (walkthrough) bezpośrednio w tym samym folderze roboczym, aby uniknąć problemów z uprawnieniami w katalogu systemowym `.gemini`.

---

## Proponowana struktura raportu `DEKONSTRUKCJA_PROJEKTU.md`

### 1. Krytyczna ocena architektury i dług technologiczny (Case Study)
*   **Analiza kodu i architektury (As-Is)**:
    *   Wskazanie antywzorca **Wielkiej Kuli Błota (Big Ball of Mud)** w obecnym kodzie.
    *   Szczegółowa dekonstrukcja `App.tsx` (miksowanie rysowania Canvas, obsługi klawiatury, synchronizacji stanu z API, React state i mobilnego UI).
    *   Brak jasnego podziału na logikę biznesową (reguły gry), logikę prezentacji i infrastrukturę (zapis SQLite/LocalStorage).
    *   Podatność na błędy i utrudnione testowanie jednostkowe (np. mockowanie window, canvas w testach e2e).
    *   Hardcoded tokeny autoryzacyjne w kodzie frontendowym i backendowym.

### 2. Identyfikacja Subdomen (Dekompozycja Domeny)
*   Podział domeny gry platformowej na:
    *   **Core Domain (Domena Główna)**: Silnik fizyki 2D, mechanika ruchu gracza, kolizje, detekcja interakcji z monetami i wyjściem, generator poziomów (to co stanowi o unikalności gry).
    *   **Supporting Subdomain (Domena Wspierająca)**: System postępu i statystyk gracza (zapisywanie stanu gry, historia poziomów, zbieranie punktów).
    *   **Generic Subdomain (Domena Ogólna)**: System uwierzytelniania i autoryzacji graczy (zarządzanie kontami użytkowników, generowanie tokenów, logowanie). Można zastąpić gotowymi rozwiązaniami (np. OAuth2, Auth0, Firebase Auth).

### 3. Projektowanie Granic Semantycznych (Bounded Contexts)
*   Wyznaczenie 3 głównych kontekstów:
    1.  **Gameplay Context (Kontekst Rozgrywki)**
    2.  **Player Progression Context (Kontekst Postępu Gracza)**
    3.  **Identity & Access Context (Kontekst Tożsamości)**
*   Zdefiniowanie **Języka Wszechobecnego (Ubiquitous Language)** dla każdego kontekstu (tabela z polskimi definicjami pojęć i ich odpowiednikami w kodzie). Eliminacja wieloznaczności (np. pojęcie `score` vs `coinsCollected`, `level` vs `levelIndex`, `user` vs `player`).
*   **Context Map (Mapa Kontekstów)**: Relacje między kontekstami (Shared Kernel, Customer-Supplier, Upstream/Downstream) wizualizowane za pomocą diagramu Mermaid.

### 4. Wizualizacja Architektury w Modelu C4
*   **Poziom 1: System Context (Kontekst Systemu)**:
    *   Diagram **As-Is** vs **To-Be**.
*   **Poziom 2: Container (Kontenery)**:
    *   Diagram **As-Is** (Monolit React + Express/SQLite).
    *   Diagram **To-Be** (odseparowany SPA Frontend, odrębny Microservice dla postępów oraz zewnętrzny system Identity provider / Auth API).
*   Diagramy zostaną wykonane przy użyciu biblioteki **Mermaid.js**, wbudowanej w standard Markdown, z dbałością o estetykę (kolory, obramowania, style linii).

---

## Plan weryfikacji raportu
1.  **Poprawność techniczna**: Weryfikacja zgodności diagramów C4 i DDD z kodem znajdującym się w `Project/src` oraz `Project/server_NH.ts`.
2.  **Kompletność wymagań**: Sprawdzenie czy wszystkie cztery punkty z instrukcji laboratoryjnej zostały wyczerpująco opracowane w języku polskim.
3.  **Estetyka i standardy**: Zapewnienie poprawności składni Mermaid (brak błędów renderingu w edytorze markdown) oraz czytelności tabel słownikowych.

## Pytania otwarte do użytkownika
*   *Brak pytań na ten moment. Zaplanowana struktura pokrywa w 100% zakres laboratorium akademickiego.*
