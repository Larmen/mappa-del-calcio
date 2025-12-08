import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper: group stadiums by rounded coordinates
function groupStadiumsByCoords(stadiums) {
  const groups = [];
  const seen = {};
  stadiums.forEach((s) => {
    const lat = Math.round(s.lat * 10000) / 10000;
    const lon = Math.round(s.lon * 10000) / 10000;
    const key = `${lat},${lon}`;
    if (!seen[key]) {
      seen[key] = [];
      groups.push(seen[key]);
    }
    seen[key].push({ ...s, lat, lon });
  });
  return groups;
}

function Map() {
  const [stadiums, setStadiums] = useState([]);
  const [matchesToday, setMatchesToday] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/map-data')
      .then((res) => res.json())
      .then((data) => setStadiums(data.data || []))
      .catch(() => setStadiums([]));
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/api/matches-today')
      .then((res) => res.json())
      .then((data) => setMatchesToday(data.data || []))
      .catch(() => setMatchesToday([]));
  }, []);

  // Get set of home team IDs playing today and a lookup for kickoff times
  const homeTeamIds = useMemo(() => {
    return new Set(matchesToday.map(match => match.homeTeam?.id));
  }, [matchesToday]);

  // Map team ID to kickoff time (no conversion)
  const teamKickoffMap = useMemo(() => {
    const map = {};
    matchesToday.forEach(match => {
      if (match.homeTeam?.id) {
        // Use local time directly
        const kickoffDate = new Date(match.utcDate || match.date || match.kickoff || match.startTime);
        if (!isNaN(kickoffDate)) {
          const hours = kickoffDate.getHours().toString().padStart(2, '0');
          const minutes = kickoffDate.getMinutes().toString().padStart(2, '0');
          map[match.homeTeam.id] = `${hours}:${minutes}`;
        }
      }
    });
    return map;
  }, [matchesToday]);

  // Group stadiums by coordinates
  const groups = useMemo(() => groupStadiumsByCoords(stadiums), [stadiums]);

  // Offset for split markers (in degrees, ~small distance)
  const OFFSET = 0.01;

  return (
    <MapContainer center={[41.94, 12.45]} zoom={5} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {groups.map((group, idx) => {
        const { lat, lon } = group[0];
        if (group.length === 1) {
          // Single team: marker at stadium
          const stadium = group[0];
          const isPlayingToday = stadium.team && homeTeamIds.has(stadium.team.id);
          const kickoffTime = isPlayingToday ? teamKickoffMap[stadium.team.id] : null;
          // Find today's match for this team
          const todaysMatch = isPlayingToday ? matchesToday.find(m => m.homeTeam?.id === stadium.team.id) : null;
          const opponent = todaysMatch ? todaysMatch.awayTeam?.name : null;
          const icon = stadium.team?.logo_url
            ? L.divIcon({
                html: `<div class=\"team-marker-bg${isPlayingToday ? ' team-marker-playing' : ''}\" style='display:flex;flex-direction:column;align-items:center;'>` +
                  (kickoffTime ? `<div class='team-marker-time'>${kickoffTime}</div>` : '') +
                  `<img src='${stadium.team.logo_url}' alt='logo' style='width:40px;height:40px;'/>
` +
                  `</div>`,
                className: `team-marker-bg${isPlayingToday ? ' team-marker-playing' : ''}`,
                iconSize: [48, 60],
                iconAnchor: [24, 60],
                popupAnchor: [0, -60],
              })
            : undefined;
          return (
            <Marker key={stadium.id} position={[lat, lon]} icon={icon}>
              <Popup>
                <div style={{textAlign: 'center'}}>
                  <strong>{stadium.stadium_name}</strong>
                  <br />
                  {stadium.team?.logo_url && (
                    <img src={stadium.team.logo_url} alt="logo" style={{width: 40, height: 40, margin: '6px auto'}} />
                  )}
                  <br />
                  Team: {stadium.team?.team_name || 'N/A'}
                  <br />
                  {isPlayingToday && opponent && (
                    <span>Playing today vs <strong>{opponent}</strong></span>
                  )}
                  <br />
                </div>
              </Popup>
            </Marker>
          );
        } else if (group.length === 2) {
          // Two teams: offset left/right
          const [teamA, teamB] = group;
          const isPlayingA = teamA.team && homeTeamIds.has(teamA.team.id);
          const isPlayingB = teamB.team && homeTeamIds.has(teamB.team.id);
          const kickoffA = isPlayingA ? teamKickoffMap[teamA.team.id] : null;
          const kickoffB = isPlayingB ? teamKickoffMap[teamB.team.id] : null;
          // Find today's match for each team
          const matchA = isPlayingA ? matchesToday.find(m => m.homeTeam?.id === teamA.team.id) : null;
          const matchB = isPlayingB ? matchesToday.find(m => m.homeTeam?.id === teamB.team.id) : null;
          const opponentA = matchA ? matchA.awayTeam?.name : null;
          const opponentB = matchB ? matchB.awayTeam?.name : null;
          const iconA = teamA.team?.logo_url
            ? L.divIcon({
                html: `<div class=\"team-marker-bg${isPlayingA ? ' team-marker-playing' : ''}\" style='display:flex;flex-direction:column;align-items:center;'>` +
                  (kickoffA ? `<div class='team-marker-time'>${kickoffA}</div>` : '') +
                  `<img src='${teamA.team.logo_url}' alt='logo' style='width:40px;height:40px;'/>
` +
                  `</div>`,
                className: `team-marker-bg${isPlayingA ? ' team-marker-playing' : ''}`,
                iconSize: [48, 60],
                iconAnchor: [24, 60],
                popupAnchor: [0, -60],
              })
            : undefined;
          const iconB = teamB.team?.logo_url
            ? L.divIcon({
                html: `<div class=\"team-marker-bg${isPlayingB ? ' team-marker-playing' : ''}\" style='display:flex;flex-direction:column;align-items:center;'>` +
                  (kickoffB ? `<div class='team-marker-time'>${kickoffB}</div>` : '') +
                  `<img src='${teamB.team.logo_url}' alt='logo' style='width:40px;height:40px;'/>
` +
                  `</div>`,
                className: `team-marker-bg${isPlayingB ? ' team-marker-playing' : ''}`,
                iconSize: [48, 60],
                iconAnchor: [24, 60],
                popupAnchor: [0, -60],
              })
            : undefined;
          return (
            <>
              <Marker key={teamA.id} position={[lat, lon - OFFSET]} icon={iconA}>
                <Popup>
                  <div style={{textAlign: 'center'}}>
                    <strong>{teamA.stadium_name}</strong>
                    <br />
                    {teamA.team?.logo_url && (
                      <img src={teamA.team.logo_url} alt="logo" style={{width: 40, height: 40, margin: '6px auto'}} />
                    )}
                    <br />
                    Team: {teamA.team?.team_name || 'N/A'}
                    <br />
                    {isPlayingA && opponentA && (
                      <span>Playing today vs <strong>{opponentA}</strong></span>
                    )}
                    <br />
                  </div>
                </Popup>
              </Marker>
              <Marker key={teamB.id} position={[lat, lon + OFFSET]} icon={iconB}>
                <Popup>
                  <div style={{textAlign: 'center'}}>
                    <strong>{teamB.stadium_name}</strong>
                    <br />
                    {teamB.team?.logo_url && (
                      <img src={teamB.team.logo_url} alt="logo" style={{width: 40, height: 40, margin: '6px auto'}} />
                    )}
                    <br />
                    Team: {teamB.team?.team_name || 'N/A'}
                    <br />
                    {isPlayingB && opponentB && (
                      <span>Playing today vs <strong>{opponentB}</strong></span>
                    )}
                    <br />
                  </div>
                </Popup>
              </Marker>
            </>
          );
        } else {
          // More than 2 teams: show a generic marker
          return (
            <Marker key={'multi-' + idx} position={[lat, lon]}>
              <Popup>
                <div>Multiple teams at this location.</div>
              </Popup>
            </Marker>
          );
        }
      })}
    </MapContainer>
  );
}

export default Map;
