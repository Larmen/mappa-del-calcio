# Implementation Plan: Specify Section (003-specify)

## Goal
Deliver an interactive map of Italian soccer stadiums (Serie A/B/C) with game highlighting, using the most cost-effective and rapid tech stack.

## Tech Stack (Cheapest & Effective)
- **Frontend:** React (Create React App or Vite), Mapbox GL JS (free tier, up to 50k map loads/month; fallback: Leaflet for zero cost)
- **Backend:** Node.js + Express (free on Heroku Hobby or AWS Free Tier)
- **Database:** PostgreSQL (free on Heroku Hobby or AWS RDS Free Tier; SQLite for MVP/local dev)
- **Data Source:** football-data.org (free tier for basic data; fallback: scrape public sites with polite rate limits)
- **Hosting:**
  - Frontend: Netlify (free tier) or Vercel (free tier)
  - Backend: Heroku (free tier) or AWS Free Tier

### Tech Choices Justification

**Frontend:**
- React is the most popular, well-supported, and free open-source UI framework. Create React App or Vite are both zero-cost and easy to set up. Mapbox GL JS offers a generous free tier for map loads; Leaflet is fully open-source and free if Mapbox limits are exceeded.

**Backend:**
- Node.js + Express is free, fast to develop, and widely supported. Heroku and AWS both offer free tiers for small apps, making them ideal for MVP and early production.

**Database:**
- PostgreSQL is robust, free, and available on all major cloud providers' free tiers. SQLite is zero-cost and perfect for local development or very small deployments.

**Data Source:**
- football-data.org provides a free API tier for basic football data. If limits are hit, scraping public sites is possible using open-source tools, with polite rate limiting and caching to avoid costs and legal issues.

**Hosting:**
- Netlify and Vercel offer free static hosting for React apps with CI/CD integration. Heroku's free tier is suitable for small Node.js backends; AWS Free Tier is an alternative for more control or scaling.

**Other:**
- All chosen techs have large communities, free documentation, and many open-source libraries, minimizing development and maintenance costs.

**Summary:**
- This stack minimizes costs by using free tiers and open-source tools, while maximizing developer speed and reliability. All components can be swapped for even cheaper alternatives if usage grows or costs increase.

## Phases

### Phase 1: MVP Data & Map
- Ingest static stadium/team data from football-data.org or CSV scrape
- Build React frontend with Mapbox GL JS (or Leaflet if cost is a concern)
- Display stadium markers, popups with team/stadium info
- Host MVP frontend on Netlify/Vercel

### Phase 2: Game Highlighting & Daily Updates
- Implement backend job (Node.js cron or Heroku Scheduler) to fetch daily game data
- Add game highlighting logic to frontend (color/badge for stadiums with games)
- Expose API endpoint `/api/map-data?date=YYYY-MM-DD` for frontend
- Store data in PostgreSQL (or SQLite for MVP)
- Host backend on Heroku (free tier)

### Phase 3: Polish & Scale
- Add bounding box filtering to API for map viewport efficiency
- Add logo lazy-loading and placeholder logic
- Add error handling, fallback for missing data
- Add basic admin dashboard for job status/logs
- Add unit/integration tests (Jest for backend, React Testing Library for frontend)
- CI/CD: GitHub Actions for auto-deploy to Netlify/Heroku

## Cost-Saving Notes
- Use free tiers for all hosting/services
- Prefer Mapbox GL JS for better UX, but switch to Leaflet if map load limits are hit
- Use football-data.org free tier; if limits are hit, scrape public sites with caching/backoff
- Use SQLite for local dev, PostgreSQL for production

## Timeline
- **Week 1:** MVP map, stadium/team ingest, basic frontend
- **Week 2:** Game highlighting, backend API, daily job
- **Week 3:** Polish, error handling, tests, deploy

## Risks & Mitigations
- **API rate limits:** Use caching, backoff, and fallback to scrape if needed
- **Mapbox cost:** Switch to Leaflet if free tier exceeded
- **Heroku/AWS cost:** Stay within free tier; monitor usage
- **Data gaps:** Show placeholders, log missing data

## Success Criteria
- All stadiums and teams visible on map
- Game highlighting works for current day
- Data updates daily with minimal cost
- App loads in <2s on mobile
- No hosting or API costs for MVP

---
*Plan generated for cheapest, fastest delivery of the specified feature.*
