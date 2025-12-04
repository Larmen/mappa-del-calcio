# Tasks: Specify Section (003-specify)
## Phase 1: MVP Data & Map
- [X] T001 Create stadium/team data ingest script (data/ingest.js)
- [X] T002 [P] Build React frontend scaffold (frontend/src/App.js)
- [X] T003 [P] Integrate Mapbox GL JS (frontend/src/components/Map.js)
- [ ] T004 [P] Display stadium markers and popups (frontend/src/components/Map.js)
- [ ] T005 Host MVP frontend on Netlify/Vercel (netlify.toml/vercel.json)

## Phase 2: Game Highlighting & Daily Updates
 [X] T006 Create backend API scaffold (backend/app.js)
 [X] T009 [P] Expose /api/map-data endpoint (backend/app.js)
 [ ] T007 [P] Implement daily game data fetch job (backend/jobs/fetchGames.js)
 [ ] T010 [P] Add game highlighting logic to frontend (frontend/src/components/Map.js)
 [ ] T011 Host backend on Heroku (Procfile, backend/)
- [ ] T021 Implement API pagination and bounding box filtering (backend/routes/mapData.js)
- [ ] T022 Validate and sanitize external data during ingestion (data/ingest.js, backend/models/)

## Phase 3: Polish & Scale
- [ ] T012 Add bounding box filtering to API (backend/routes/mapData.js)
- [ ] T013 [P] Add logo lazy-loading and placeholder logic (frontend/src/components/Map.js)
- [ ] T014 [P] Add error handling and fallback for missing data (backend/app.js, frontend/src/components/Map.js)
- [ ] T015 [P] Add basic admin dashboard for job status/logs (frontend/src/components/AdminDashboard.js)
- [ ] T016 Add unit/integration tests (backend/tests/, frontend/src/__tests__/)
- [ ] T017 Set up CI/CD with GitHub Actions (/.github/workflows/ci.yml)
- [ ] T023 Performance/load time testing and optimization (frontend/src/__tests__/, backend/tests/)

## Cross-Cutting
- [ ] T018 [P] Document API keys/secrets management (README.md, .env.example)
- [ ] T019 [P] Monitor free tier usage and switch to cheaper alternatives if needed (README.md)

## Ongoing & Finalization
- [ ] T020 Review and validate app against success criteria (map loads <2s, all stadiums/teams visible, game highlighting works, daily updates)

---
*All tasks are actionable, file-specific, and organized by phase. Parallelizable tasks are marked [P].*

## Phase 1: MVP Data & Map
- [ ] T001 Create stadium/team data ingest script (data/ingest.js)
- [ ] T002 [P] Build React frontend scaffold (frontend/src/App.js)
- [ ] T003 [P] Integrate Mapbox GL JS (frontend/src/components/Map.js)
- [ ] T004 [P] Display stadium markers and popups (frontend/src/components/Map.js)
- [ ] T005 Host MVP frontend on Netlify/Vercel (netlify.toml/vercel.json)

## Phase 2: Game Highlighting & Daily Updates
- [ ] T006 Create backend API scaffold (backend/app.js)
- [ ] T007 [P] Implement daily game data fetch job (backend/jobs/fetchGames.js)
- [ ] T008 [P] Store data in PostgreSQL (backend/models/)
- [ ] T009 [P] Expose /api/map-data endpoint (backend/routes/mapData.js)
- [ ] T010 [P] Add game highlighting logic to frontend (frontend/src/components/Map.js)
- [ ] T011 Host backend on Heroku (Procfile, backend/)

## Phase 3: Polish & Scale
- [ ] T012 Add bounding box filtering to API (backend/routes/mapData.js)
- [ ] T013 [P] Add logo lazy-loading and placeholder logic (frontend/src/components/Map.js)
- [ ] T014 [P] Add error handling and fallback for missing data (backend/app.js, frontend/src/components/Map.js)
- [ ] T015 [P] Add basic admin dashboard for job status/logs (frontend/src/components/AdminDashboard.js)
- [ ] T016 Add unit/integration tests (backend/tests/, frontend/src/__tests__/)
- [ ] T017 Set up CI/CD with GitHub Actions (/.github/workflows/ci.yml)

## Cross-Cutting
- [ ] T018 [P] Document API keys/secrets management (README.md, .env.example)
- [ ] T019 [P] Monitor free tier usage and switch to cheaper alternatives if needed (README.md)

---
*All tasks are actionable, file-specific, and organized by phase. Parallelizable tasks are marked [P].*
