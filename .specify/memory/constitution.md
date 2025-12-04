# Mappa di Calcio Constitution

Purpose:
- Provide an interactive map of Italian soccer stadiums for Serie A, Serie B, and Serie C, with team and game information and a usable, performant UI on desktop and mobile.

Scope:
- Map markers for all stadiums in Serie A/B/C with popups showing team name, logo, stadium name, capacity, and a link to the team page.
- Highlight stadiums with ongoing games on the current day.
- Maintain an efficient daily update for static data (teams, stadiums) and a separate short-interval update mechanism for match status.

Primary goals / acceptance criteria:
- All stadiums for Serie A/B/C are displayed with correct coordinates and a visible popup.
- Game highlighting updates within a configurable target (e.g., 60–120s) when live mode is enabled.
- Page loads under 2s on common mobile connections; map remains interactive with >100 markers.
- Data ingestion tests validate schema and catch missing coordinates or logos.

Primary Tech Stack:
- Frontend: React; map rendering with Mapbox GL JS or Leaflet (Mapbox recommended for vector tiles/performance).
- Backend: Node.js + Express; scheduled jobs for static updates; optional websocket/REST for live updates.
- Scheduler: cron or serverless scheduler for daily data refresh; for live matches use either polling (configurable interval) or webhook integration if provider supports it.
- Database: PostgreSQL with PostGIS (preferred) or MongoDB for storage and spatial queries.

Data sources & licensing:
- Prefer official/paid APIs (e.g., football-data.org, sportsdata.io). Document chosen provider, API keys, and rate limits.
- If scraping is used, comply with robots.txt and provider Terms of Service. Implement polite request pacing, caching, and backoff strategies.

Minimum data schema (stadium/team):
- `id`, `team_name`, `league`, `stadium_name`, `capacity`, `logo_url`, `lat`, `lon`, `source`, `last_updated`

Operational notes:
- Static data: run a daily job to refresh teams/stadiums and logos.
- Live game status: choose polling interval or implement webhooks/streaming depending on provider capabilities. Backoff on failures; maintain cache TTLs.
- Map UX: cluster markers at low zoom; lazy-load logos and use placeholders; allow filtering by league and today’s games.
- Error handling: show graceful placeholders when data is unavailable; log ingestion failures and send alerts for repeated failures.

Testing & Deployment:
- Unit tests for data ingestion and schema validation.
- Integration tests for backend endpoints.
- CI pipeline to run tests and deploy to chosen hosting; include DB migration steps.

Security & privacy:
- Store API keys securely (environment variables or secret store).
- Respect user privacy; do not collect personal user data for this project.

Notes:
- Clarify "real-time" expectations: if true real-time is required, plan for webhooks/streaming or high-frequency polling and confirm provider support and rate limits.
- Document the chosen data provider and maintain a fallback strategy in case of outages.
