// __tests__/ingest.test.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('ingest.js', () => {
  const outputPath = path.join(__dirname, '../stadiums.json');

  afterEach(() => {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  });

  test('should create stadiums.json with at least one stadium', () => {
    // Run the ingest script
    require('child_process').execSync('node ../ingest.js', { cwd: __dirname });
    expect(fs.existsSync(outputPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('stadium_name');
  });
});
