const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();
// CORS must be first
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// --- MATCH SYNC AND API ---
let todayMatchesCache = { lastUpdated: null, matches: [] };

async function fetchTodayMatches() {
  const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY || '';
  if (!API_TOKEN) return [];
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const url = `https://api.football-data.org/v4/competitions/SA/matches?dateFrom=${today}&dateTo=${today}`;
  try {
    const resp = await axios.get(url, { headers: { 'X-Auth-Token': API_TOKEN } });
    return resp.data.matches || [];
  } catch (err) {
    console.error('Failed to fetch today matches:', err.message);
    return [];
  }
}

async function updateTodayMatchesCache() {
  todayMatchesCache.matches = await fetchTodayMatches();
  todayMatchesCache.lastUpdated = new Date().toISOString();
}

// Run at 02:00 every day
cron.schedule('0 2 * * *', () => {
  updateTodayMatchesCache();
});

// Also update on server start
updateTodayMatchesCache();

app.get('/api/matches-today', (req, res) => {
  res.json({ data: todayMatchesCache.matches, lastUpdated: todayMatchesCache.lastUpdated });
});
// Manual overrides for problematic stadiums
const stadiumOverrides = {
        "Stadio Giovanni Zin": { lat: 45.140044, lon: 10.0350005 }, // US Cremonese
        "Arena Garibaldi - Stadio Romeo Anconetani": { lat: 43.7191, lon: 10.4036 }, // AC Pisa
      "Stadio Marc'Antonio Bentegodi": { lat: 45.4104, lon: 10.9570 }, // Hellas Verona
    "Stadio Comunale Via Del Mare": { lat: 40.3537, lon: 18.1729 }, // Lecce
  // Stadium name: [lat, lon]
  "Stadio San Paolo": { lat: 40.827, lon: 14.193 }, // Napoli
  "Stadio Atleti Azzurri d'Italia": { lat: 45.695, lon: 9.674 }, // Atalanta (old name, now Gewiss Stadium)
  "Gewiss Stadium": { lat: 45.695, lon: 9.674 }, // Atalanta (new name)
  "Allianz Stadium": { lat: 45.1096, lon: 7.6413 }, // Juventus
  "Allianz Stadium Juventus": { lat: 45.1096, lon: 7.6413 }, // Juventus (alternate name)
};
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());


// Geocode helper using OpenStreetMap Nominatim
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  try {
    const resp = await axios.get(url, { headers: { 'User-Agent': 'mappa-di-calcio/1.0' } });
    if (resp.data && resp.data.length > 0) {
      return {
        lat: parseFloat(resp.data[0].lat),
        lon: parseFloat(resp.data[0].lon),
      };
    }
  } catch (err) {
    console.error('Geocoding failed for address:', address, err.message);
  }
  return { lat: 0, lon: 0 };
}

// Helper to fetch stadium/team data from football-data.org and geocode locations, then cache
async function fetchAndCacheStadiums() {
  const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY || '';
  if (!API_TOKEN) throw new Error('Missing FOOTBALL_DATA_API_KEY');
  const url = 'https://api.football-data.org/v4/competitions/SA/teams';
  const resp = await axios.get(url, { headers: { 'X-Auth-Token': API_TOKEN } });
  const teams = resp.data.teams;
  const stadiums = [];
  console.log(teams.length, 'teams fetched from football-data.org');

  // Print teams playing today
  try {
    const todayMatchesResp = await axios.get(`https://api.football-data.org/v4/competitions/SA/matches?dateFrom=${new Date().toISOString().slice(0, 10)}&dateTo=${new Date().toISOString().slice(0, 10)}`, { headers: { 'X-Auth-Token': API_TOKEN } });
    const todayMatches = todayMatchesResp.data.matches || [];
    const teamsPlayingToday = todayMatches.map(m => `${m.homeTeam.name} vs ${m.awayTeam.name}`);
    console.log('Teams playing today:', teamsPlayingToday.length ? teamsPlayingToday.join(' | ') : 'None');
  } catch (err) {
    console.log('Could not fetch today matches:', err.message);
  }

  for (const team of teams) {
    // Use only stadium name for geocoding, with manual overrides for problematic stadiums
    let coords = { lat: 0, lon: 0 };
    const stadiumName = team.venue || 'Unknown';
    if (stadiumOverrides[stadiumName]) {
      coords = stadiumOverrides[stadiumName];
    } else if (stadiumName !== 'Unknown') {
      coords = await geocodeAddress(stadiumName);
    }
    stadiums.push({
      id: stadiumName || team.id,
      stadium_name: stadiumName,
      lat: coords.lat,
      lon: coords.lon,
      capacity: null,
      team: {
        id: team.id,
        team_name: team.name,
        league: 'serie_a',
        logo_url: team.crest,
        city: team.address || '',
      },
      source: 'football-data.org',
      last_updated: new Date().toISOString(),
    });
  }
  // Write to cache
  const cachePath = path.join(__dirname, 'stadiumCache.json');
  fs.writeFileSync(cachePath, JSON.stringify({ lastUpdated: new Date().toISOString(), stadiums }, null, 2));
  return stadiums;
}

function loadStadiumCache() {
  const cachePath = path.join(__dirname, 'stadiumCache.json');
  if (fs.existsSync(cachePath)) {
    try {
      const cache = JSON.parse(fs.readFileSync(cachePath));
      return cache;
    } catch (e) {
      return { lastUpdated: null, stadiums: [] };
    }
  }
  return { lastUpdated: null, stadiums: [] };
}

let stadiumCache = loadStadiumCache();

async function refreshStadiumCacheIfNeeded(force = false) {
  const now = Date.now();
  const last = stadiumCache.lastUpdated ? new Date(stadiumCache.lastUpdated).getTime() : 0;
  // 24 hours in ms
  if (force || now - last > 24 * 60 * 60 * 1000) {
    stadiumCache.stadiums = await fetchAndCacheStadiums();
    stadiumCache.lastUpdated = new Date().toISOString();
  }
}

// On server start, refresh cache
refreshStadiumCacheIfNeeded(true);

// Schedule refresh every 24 hours
setInterval(() => {
  refreshStadiumCacheIfNeeded();
}, 24 * 60 * 60 * 1000);

const mockStadiums = [
  {
    id: 'stadium_001',
    stadium_name: 'Stadio Olimpico',
    lat: 41.94,
    lon: 12.45,
    capacity: 70000,
    team: {
      id: 'team_roma',
      team_name: 'AS Roma',
      league: 'serie_a',
      logo_url: 'https://cdn.example.com/logos/roma.png',
    },
    source: 'mock',
    last_updated: new Date().toISOString(),
  },
];

app.get('/api/map-data', async (req, res) => {
  try {
    // Always serve from cache
    res.json({ data: stadiumCache.stadiums });
  } catch (err) {
    console.error('Failed to serve stadium cache:', err.message);
    res.json({ data: [], error: 'No stadium data available.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
