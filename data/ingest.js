// data/ingest.js
// Script to ingest stadium and team data for Italian Serie A/B/C
// Usage: node data/ingest.js [--source football-data|csv] [--output data.json]

const fs = require('fs');
const path = require('path');

// Placeholder: Choose your data source here
const DATA_SOURCE = process.env.DATA_SOURCE || 'football-data';

async function fetchFootballData() {
  // TODO: Implement fetch from football-data.org API
  // For now, return mock data
  return [
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
    // ...more stadiums
  ];
}

async function main() {
  let stadiums;
  if (DATA_SOURCE === 'football-data') {
    stadiums = await fetchFootballData();
  } else {
    // TODO: Implement CSV ingest
    stadiums = [];
  }
  const outputPath = path.join(__dirname, 'stadiums.json');
  fs.writeFileSync(outputPath, JSON.stringify(stadiums, null, 2));
  console.log(`Ingested ${stadiums.length} stadiums to ${outputPath}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Ingest failed:', err);
    process.exit(1);
  });
}
