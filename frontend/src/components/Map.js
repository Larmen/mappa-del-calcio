import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + Webpack
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

function Map() {
  const [stadiums, setStadiums] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/map-data')
      .then((res) => res.json())
      .then((data) => setStadiums(data.data || []))
      .catch(() => setStadiums([]));
  }, []);

  return (
    <MapContainer center={[41.94, 12.45]} zoom={5} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {stadiums.map((stadium) => {
        // Use logo_url as custom marker icon if available
        const icon = stadium.team?.logo_url
          ? new L.Icon({
              iconUrl: stadium.team.logo_url,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
              className: 'team-logo-marker',
            })
          : undefined;
        return (
          <Marker key={stadium.id} position={[stadium.lat, stadium.lon]} icon={icon}>
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
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default Map;
