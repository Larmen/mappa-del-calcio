import React from 'react';
import Map from './components/Map';
import TodaysGames from './components/TodaysGames';

function App() {
  return (
    <div>
      <TodaysGames />
      <h1>Mappa del Calcio</h1>
      <p>Welcome to the Italian Stadium Map MVP!</p>
      <Map />
    </div>
  );
}

export default App;
