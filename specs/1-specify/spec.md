# Feature Specification: Add "Specify" Section

**Feature Branch**: `1-specify`  
**Created**: 2025-12-03  
**Status**: Draft  
**Input**: User description: "Add the 'Specify' section containing target user stories, frontend/backend features, tech breakdown, data and hosting details."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View stadiums on map (Priority: P1)

As a user, I want to see all stadiums on an interactive map with the ability to click on them to get more information.

**Why this priority**: Core public-facing capability — without it the map provides no value.

**Independent Test**: Load the map page with the dataset and verify that markers exist for all stadiums; click a marker and verify a popup appears with stadium details.

**Acceptance Scenarios**:

1. **Given** the map page is loaded with stadium data, **When** the user pans/zooms, **Then** markers should appear at the correct geographic locations.
2. **Given** a marker is visible, **When** the user clicks the marker, **Then** a popup opens showing stadium information.

---

### User Story 2 - Show team logo and stadium name (Priority: P1)

As a user, I want to see the team logo and the stadium name when I click on a stadium on the map.

**Why this priority**: Primary UI detail that enables quick recognition of teams and stadiums.

**Independent Test**: Click any stadium marker: the popup should show stadium name and either the team logo or a placeholder image when logo missing.

**Acceptance Scenarios**:

1. **Given** a stadium has a `logo_url`, **When** the popup is displayed, **Then** the logo image is shown alongside the stadium name.
2. **Given** a stadium has no `logo_url`, **When** the popup is displayed, **Then** a default placeholder image is shown and the stadium name is visible.

---

### User Story 3 - Visual indication for games (Priority: P1)

As a user, I want to know when a game is happening at a stadium on a specific day by seeing a visual indication.

**Why this priority**: Key user need to surface activity and focus attention on active venues.

**Independent Test**: For a known date with scheduled matches, load the map for that date and verify markers for stadiums hosting games are visually distinct (color, badge, or icon change).

**Acceptance Scenarios**:

1. **Given** the backend provides the day’s games, **When** the frontend requests map data, **Then** stadium markers for that day include a flag/field indicating a scheduled game and the map displays the visual highlight.
2. **Given** a stadium has multiple games (double fixtures), **When** displayed, **Then** the highlight indicates activity and popup lists the games for that day.

---

### User Story 4 - Admin-triggered daily updates (Priority: P2)

As an admin, I want the data (team info, stadium info, games) to be updated once per day to reflect the latest status.

**Why this priority**: Ensures static and schedule data remain accurate; lower priority than front-end interactions but necessary for correctness.

**Independent Test**: Trigger the scheduled job (or simulate it) and verify the database records are updated, `last_updated` timestamps change, and the frontend reflects updated items after the job completes.

**Acceptance Scenarios**:

1. **Given** the scheduled update runs, **When** it completes successfully, **Then** the backend's `last_updated` fields are updated and the API returns refreshed data.
2. **Given** the scheduled update fails, **When** failure occurs, **Then** the system logs the error and raises an alert for the admin (no silent failure).

---

### Edge Cases

- Markers with invalid or missing coordinates should be omitted from the map and reported by ingestion tests.
- Logos that fail to load should fall back to a local placeholder and should not block the popup rendering.
- Rate-limited or offline data provider: the daily update job should respect backoff and use cached data; if stale beyond a threshold, show a warning in admin logs.
- Very dense marker clusters (e.g., multiple stadiums in the same city) should remain usable: clustering or marker offset must allow individual selection.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an endpoint `GET /api/map-data?date=YYYY-MM-DD` that returns stadiums, teams, coordinates, logos, capacities, and a boolean/flag indicating if a game is scheduled on that date.
- **FR-002**: The frontend MUST render clickable markers for each stadium returned by `GET /api/map-data` and open a popup on click showing stadium name, team name, capacity, and logo.
- **FR-003**: The frontend MUST visually highlight markers for stadiums hosting games on the requested date (color, badge, or overlay).
- **FR-004**: The backend MUST run a scheduled job once per day to fetch team, stadium, and game data from the chosen data provider and update the database; each record must include a `source` and `last_updated` timestamp.
- **FR-005**: The system MUST gracefully handle missing logos by returning a placeholder URL or a null `logo_url` that the frontend treats as "use placeholder".
- **FR-006**: The scheduled job MUST implement exponential backoff on transient failures and log errors; a failure alert must be raised if the job fails 3 times consecutively.
- **FR-007**: The API responses MUST be paginated or limited appropriately to avoid very large payloads; `GET /api/map-data` should support returning only stadiums within a bounding box for map viewport efficiency.
- **FR-008**: The system MUST sanitize and validate all external data (coordinates numeric, strings length-limited) during ingestion and reject or mark invalid records.

### Key Entities

- **Stadium**: `id`, `stadium_name`, `lat`, `lon`, `capacity`, `team_id`, `source`, `last_updated`
- **Team**: `id`, `team_name`, `league`, `logo_url`, `official_page`, `source`, `last_updated`
- **Game**: `id`, `home_team_id`, `away_team_id`, `stadium_id`, `kickoff_time` (ISO8601), `competition`, `status`, `source`, `last_updated`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Serie A/B/C stadiums present in the chosen data source are displayed on the map within 2 days of inclusion in the source.
- **SC-002**: For the day’s schedule, 95% of stadium markers that host games are visually highlighted correctly in the map UI.
- **SC-003**: Map page median load time is under 2 seconds on a standard mobile connection (3G/4G throttled test conditions) with default zoom and 100 markers.
- **SC-004**: Daily update job completes within 30 minutes for the full dataset and raises no unhandled exceptions; failures are alerted.
- **SC-005**: No more than 1% of ingested records are rejected due to validation errors in normal operations (excluding known provider data issues).

## Tech Breakdown & Implementation Notes

- Frontend: React app with Mapbox GL JS or Leaflet for rendering. Use marker clustering and viewport-based requests to `GET /api/map-data` with bounding box parameters.
- Data fetching: Backend scheduled job (cron or scheduler) to call chosen Football API, normalize payload to internal schema, and upsert stadium/team/game records.
- API: `GET /api/map-data?date=YYYY-MM-DD&bbox=minLon,minLat,maxLon,maxLat` returns the required fields; support `?league=serie_a|serie_b|serie_c` filter.
- Caching: Use HTTP caching headers and server-side cache (e.g., Redis) to reduce load on DB and external providers.
- Secrets: Store API keys in environment variables or a secrets manager.

## Data & Hosting

- Data Source: Prefer official football-data providers (e.g., football-data.org); document chosen provider and store their `provider_id` on ingested records.
- Frontend Hosting: Vercel or Netlify.
- Backend Hosting: Heroku, AWS, or similar. Database: PostgreSQL with PostGIS (preferred) or MongoDB.

## Assumptions

- The daily update requirement is sufficient for the admin requirement; live match updates (sub-minute) are not required by default and would need a separate design decision.
- Logos are available via the provider or can be scraped; when unavailable, placeholders are acceptable.
- API rate limits and provider terms will be respected via caching and backoff strategies.

## Next Steps

- Choose and document the primary data provider and obtain API access keys.
- Draft the API contract for `GET /api/map-data` including example payloads and error codes.
- Implement a small ingestion prototype that upserts stadium and team records and exposes `GET /api/map-data` for a bounding box.

---

*Spec created from template and user-provided "Specify" content.*
