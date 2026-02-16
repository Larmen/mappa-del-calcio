import React from 'react';
import Map from './components/Map';
import TodaysGames from './components/TodaysGames';

function App() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <TodaysGames />
      <div id="header">
        <h1>Mappa del Calcio</h1>
        <p>Welcome to the Italian Stadium Map MVP!</p>
      </div>
      <div style={{flex: 1, minHeight: 0}}>
        <Map />
      </div>
    </div>
  );
}

export default App;
