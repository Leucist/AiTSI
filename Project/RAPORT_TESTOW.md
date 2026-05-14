# Raport z Wykonania Testów Automatycznych

**Data wygenerowania:** 2026-05-14 02:58:07

---

## Podsumowanie Wyników

| Rodzaj Testów | Narzędzie | Zakończone Sukcesem | Zakończone Błędem | Wszystkie |
|---|---|---|---|---|
| Testy Jednostkowe | Vitest | [Pass] 90 | [Fail] 0 | 90 |
| Testy E2E / UI | Playwright | [Pass] 83 | [Fail] 0 | 83 |

---

## Szczegóły: Vitest (Testy Jednostkowe)

### Zestaw: `data.spec.ts`
- [Pass] 21. Coin Set should be converted to Array before JSON.stringify (Array.from check)
- [Pass] 22. Save object should contain required keys (score, levelIndex, coinsCollected)
- [Pass] 23. Bearer Token should be correctly used in headers
- [Pass] 24. SAVE_KEY should be constant and correct
- [Pass] 25. Fetch configuration for saving (POST)
- [Pass] 26. validateSaveData should reject negative score
- [Pass] 27. validateSaveData should reject non-existent level indices
- [Pass] 28. coinsCollected after loading should be a Set (new Set)
- [Pass] 29. Auth mock should return 401 for an empty token
- [Pass] 30. Particle lifetime should decrease (Logic simulation)


### Zestaw: `game-logic.spec.ts`
- [Pass] 11. Coin collection distance should use Pythagorean theorem (25px threshold)
- [Pass] 12. Coin should NOT be collected at distance > 25
- [Pass] 13. Collecting a coin should add +10 to the score
- [Pass] 14. Set should NOT allow collecting the same coin twice
- [Pass] 15. Level exit should be determined by AABB collision with the door
- [Pass] 16. State change to game-over (Logical check)
- [Pass] 17. Level transition should correctly sum the result
- [Pass] 18. LevelIndex should not exceed the limit (App logic check)
- [Pass] 19. Restart should reset score through current helpers
- [Pass] 20. Facing direction should update logically based on vx


### Zestaw: `physics.spec.ts`
- [Pass] 1. Gravity should increment vertical velocity (using config.GRAVITY)
- [Pass] 2. Jump should set negative vertical velocity (Simulated)
- [Pass] 3. Player should fall faster with each frame
- [Pass] 4. Vertical velocity should be 0 after landing on a platform
- [Pass] 5. updatePosition should correctly move the player based on velocity
- [Pass] 6. constrainToBoundaries should stop player at the left edge
- [Pass] 7. Player position should be corrected after landing (on top of platform)
- [Pass] 8. Grounded should be true after colliding with a platform from top
- [Pass] 9. Side collision should stop horizontal movement
- [Pass] 10. Player should not exit beyond the right boundary


### Zestaw: `unit-physics-core_NH.test.ts`
- [Pass] 1. should apply gravity correctly
- [Pass] 2. should update position based on velocity
- [Pass] 3. should detect if player is on top of a platform
- [Pass] 4. should detect collision from the side
- [Pass] 5. should constrain player within left boundary
- [Pass] 6. should constrain player within right boundary
- [Pass] 7. should trigger game over if player falls below bottom
- [Pass] 8. should correctly detect collision overlap
- [Pass] 9. should correctly detect collision overlap
- [Pass] 10. should handle multiple platforms simultaneously


### Zestaw: `unit-gameplay-mechanics_NH.test.ts`
- [Pass] 11. should collect a coin when close enough
- [Pass] 12. should NOT collect a coin when far away
- [Pass] 13. should NOT collect a coin that is already collected
- [Pass] 14. should detect collision with the exit door
- [Pass] 15. should NOT detect collision with a far away exit door
- [Pass] 16. should correctly update score by +10 for one coin
- [Pass] 17. should correctly update score for multiple coins
- [Pass] 18. should handle zero coins collection without changing score
- [Pass] 19. should distinguish between different coins
- [Pass] 20. should allow collecting multiple coins in one check if overlapping


### Zestaw: `unit-hazards_VM.test.ts`
- [Pass] 1. should calculate distance correctly for positive coordinates
- [Pass] 2. should calculate distance as 0 for same point
- [Pass] 3. should handle negative coordinates in distance calculation
- [Pass] 4. should detect collision between overlapping rectangles
- [Pass] 5. should not detect collision for separated rectangles
- [Pass] 6. should detect overlap on edges
- [Pass] 7. should not overlap if touching only (x+w = x2)
- [Pass] 8. should calculate large distances without overflow
- [Pass] 9. should handle small floating point distances
- [Pass] 10. should handle horizontal-only distance


### Zestaw: `unit-particles-helpers_VM.test.ts`
- [Pass] 1. should decrement particle lifetime by 0.02 (loop.ts:106)
- [Pass] 2. should filter out dead particles (loop.ts:107)
- [Pass] 3. should randomize particle speed (-2 to +2 range via loop.ts:42/43)
- [Pass] 4. should apply friction 0.8 to horizontal velocity (loop.ts:63)
- [Pass] 5. should set vx to MOVE_SPEED on ArrowRight (loop.ts:60)
- [Pass] 6. Math.floor should round score for display (same as hud.spec.ts check)
- [Pass] 7. should format total score string correctly
- [Pass] 8. should calculate collected percentage (Helper logic)
- [Pass] 9. should handle score overflow prevention (logical check)
- [Pass] 10. should handle negative score clamping (Helper logic)


### Zestaw: `unit-data-integrity_NH.test.ts`
- [Pass] 21. should pass validation for correct save data
- [Pass] 22. should fail validation if levelIndex is negative
- [Pass] 23. should fail validation if score is negative
- [Pass] 24. should fail validation if coinsCollected is not an array
- [Pass] 25. should fail validation for null/undefined data
- [Pass] 26. should have at least 3 levels defined in constants
- [Pass] 27. each level should have a starting position
- [Pass] 28. each level should have at least one platform
- [Pass] 29. each level should have coins defined
- [Pass] 30. exit should be within canvas boundaries for each level


### Zestaw: `unit-state_VM.test.ts`
- [Pass] 1. should invalidate empty save data object
- [Pass] 2. should check for missing required keys in JSON via validator
- [Pass] 3. should invalidate data if coinsCollected is missing
- [Pass] 4. should validate data against real LEVELS count
- [Pass] 5. should handle max score validation (logical boundary)
- [Pass] 6. should transition state logically (playing -> win)
- [Pass] 7. should transition state logically (playing -> game-over)
- [Pass] 8. should transition state logically (paused -> playing)
- [Pass] 9. should transition state logically (start -> playing)
- [Pass] 10. should validate level index range based on LEVELS constants


---

## Szczegóły: Playwright (Testy E2E / UI)

### Zestaw: `api/auth-state.spec.ts`
#### Zestaw: `Zarządzanie Stanem (Uwierzytelnianie/Sesja - storageState)`
- [Pass] 1. Aplikacja automatycznie wykrywa zapisaną sesję po wejściu
- [Pass] 2. Wczytany stan autoryzacji ładuje odpowiedni wynik punktowy gracza
- [Pass] 3. Wczytany stan omija początkowe etapy i od razu ładuje chroniony poziom zaawansowany


### Zestaw: `api/backend-saves.spec.ts`
#### Zestaw: `Backend Saves and API`
- [Pass] [R8] Saving from Pause menu hits backend API successfully
- [Pass] [R8] Saved game updates the SQLite DB correctly
- [Pass] [R9] Missing auth token results in 401 error
- [Pass] [R9] Incorrect auth token results in 401 error
- [Pass] [R9] Backend correctly responds with hasSave = false when empty
- [Pass] [R9] Backend correctly serves the latest save data
- [Pass] [R9] Reloading page correctly fetches save data from Backend via API
- [Pass] [R9] Continuing game fetches level index and score properly from Backend
- [Pass] [R8] Backend properly overrides duplicate saves for same user
- [Pass] [R9] Starting a new adventure from Home Screen ignores existing save


### Zestaw: `api/mocking.spec.ts`
#### Zestaw: `Mockowanie danych API (Route Mocking)`
- [Pass] [Mocking] Przechwycenie /api/load wstrzykuje sztuczny stan gracza
- [Pass] [Mocking] Symulacja błędu 500 serwera podczas odczytu /api/load
- [Pass] [Mocking] Przechwycenie /api/save aby zweryfikować fallback do LocalStorage
- [Pass] [Mocking] /api/load zafałszowany powrót granicznej liczby punktów (np. 99999)
- [Pass] [Mocking] /api/save symulacja błędu 400 Bad Request
- [Pass] [Mocking] /api/load z uszkodzoną strukturą JSON (data: null)
- [Pass] [Mocking] Przechwycenie /api/load z opóźnieniem sieciowym (latency)
- [Pass] [Mocking] /api/load zwrot statusu 401 Unauthorized
- [Pass] [Mocking] /api/save odpowiedź serwera w formacie HTML zamiast JSON


### Zestaw: `api/storage.spec.ts`
#### Zestaw: `LocalStorage save handling`
- [Pass] continue journey visible when save exists before first load
- [Pass] continue journey hidden again after removing save and reload
- [Pass] load keeps start overlay hidden after click
- [Pass] save writes JSON that contains expected keys


### Zestaw: `mechanics/game-rules.spec.ts`
#### Zestaw: `Game Logic and Progression`
- [Pass] [R7] Initial score begins at 0
- [Pass] [R7] Initial coins collected begins empty
- [Pass] [R4] Player touching a coin adds it to collected Set
- [Pass] [R4] Player touching a coin increments the score by +10
- [Pass] [R7] HUD score updates immediately after coin collect
- [Pass] [R4] Collecting same coin space twice does not double count
- [Pass] [R4] Multiple coins correctly stack scores
- [Pass] [R5] Reaching the end door triggers Level Complete overlay
- [Pass] [R5] Level transition to Level 2 sets correct levelIndex
- [Pass] [R10] Navigating to the end of the final level triggers Win Overlay


### Zestaw: `mechanics/player-movement.spec.ts`
#### Zestaw: `Player Movement Mechanics`
- [Pass] [R10] Player begins at expected start position
- [Pass] [R1] Player moves right when ArrowRight is held
- [Pass] [R1] Player moves left when ArrowLeft is held
- [Pass] [R2] Player executes jump with ArrowUp when grounded
- [Pass] [R3] Player gets affected by gravity pulling down
- [Pass] [R1] Player facing direction updates right
- [Pass] [R1] Player facing direction updates left
- [Pass] [R2] Player cannot jump when in air
- [Pass] [R3] Player is grounded when standing on a platform
- [Pass] [R1] Player stops completely if no movement keys are pressed


### Zestaw: `mechanics/ui-and-boundaries.spec.ts`
#### Zestaw: `UI Interactions and Boundaries`
- [Pass] [R6] Player falling out of bounds triggers Game Over
- [Pass] [R3] Player respects left boundary
- [Pass] [R1][R2] Player can move left and jump simultaneously
- [Pass] [R1][R2] Player can move right and jump simultaneously
- [Pass] [R7] HUD shows correct level initially as STAGE 1 / 3
- [Pass] [R10] Pause menu appears when Escape is pressed while playing
- [Pass] [R10] Pause menu resumes game when Resume is clicked
- [Pass] [R7] HUD shows 0 score after game over and restart
- [Pass] [R6] Game Over state correctly resets game mechanics when starting new game
- [Pass] [R6] Restarting the game from Game Over leaves no residual coins


### Zestaw: `ui/app.spec.ts`
#### Zestaw: `Smoke / Start screen`
- [Pass] shows start overlay
- [Pass] canvas exists
- [Pass] continue button hidden when no save
- [Pass] new adventure starts game (hud visible)


#### Zestaw: `HUD & Pause`
- [Pass] hud shows initial score
- [Pass] hud shows coins counter
- [Pass] pause button opens pause overlay
- [Pass] escape toggles pause on/off
- [Pass] resume closes pause overlay
- [Pass] quit to menu returns to start overlay


#### Zestaw: `Save / Load`
- [Pass] save button writes localStorage key
- [Pass] save from pause writes localStorage key
- [Pass] continue journey appears after save and reload
- [Pass] continue journey loads into playing (hud visible)
- [Pass] continue journey loads saved score into hud


### Zestaw: `ui/hud.spec.ts`
#### Zestaw: `HUD`
- [Pass] hud is visible in playing
- [Pass] hud score is numeric
- [Pass] hud level contains STAGE
- [Pass] save button exists and is enabled
- [Pass] pause button exists and is enabled


### Zestaw: `ui/overlays.spec.ts`
#### Zestaw: `Overlays`
- [Pass] start overlay contains new adventure button
- [Pass] start overlay hides after starting game
- [Pass] pause overlay contains buttons
- [Pass] paused overlay disappears on resume
- [Pass] level complete overlay not visible on fresh start
- [Pass] game over overlay not visible on fresh start
- [Pass] win overlay not visible on fresh start

