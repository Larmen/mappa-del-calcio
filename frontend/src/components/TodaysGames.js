import React, { useEffect, useState } from 'react';
import './TodaysGames.css';

function TodaysGames() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/matches-today')
      .then((res) => res.json())
      .then((data) => setMatches(data.data || []));
  }, []);

  return (
    <div className="todays-games-container">
      <h3>Today's Games</h3>
      <div className="todays-games-list">
        {matches.length === 0 && <div className="todays-games-empty">No games today.</div>}
        {matches.length > 0 && (
          <table className="todays-games-table">
            <tbody>
              {matches.map(match => {
                const kickoffDate = new Date(match.utcDate || match.date || match.kickoff || match.startTime);
                const hours = kickoffDate.getHours().toString().padStart(2, '0');
                const minutes = kickoffDate.getMinutes().toString().padStart(2, '0');
                return (
                  <tr className="todays-games-row" key={match.id}>
                    <td className="todays-games-time">{hours}:{minutes}</td>
                    <td className="todays-games-home">
                      <img className="todays-games-logo" src={match.homeTeam.crest} alt={match.homeTeam.name} />
                      <span className="todays-games-team">{match.homeTeam.name}</span>
                    </td>
                    <td className="todays-games-vs">-</td>
                    <td className="todays-games-away">
                      <img className="todays-games-logo" src={match.awayTeam.crest} alt={match.awayTeam.name} />
                      <span className="todays-games-team">{match.awayTeam.name}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TodaysGames;
