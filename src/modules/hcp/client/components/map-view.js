import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// location: { latitude, longitude }
const MapView = ({ location }) => {
    const [map, setMap] = useState(null)
    const zoom = 12;

    useEffect(() => {
        map && map.setView([location.latitude, location.longitude]);
    }, [location, map]);

    const mmarkerIcon = L.icon({
        iconUrl: '/assets/images/marker-icon.png',
        iconSize: [41, 41],
        iconAnchor: [13, 41]
    });

    return (
        <MapContainer
            zoom={zoom} style={{ height: 250 }}
            whenCreated={setMap}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            <Marker position={[location.latitude, location.longitude]} icon={mmarkerIcon}></Marker>
        </MapContainer>
    );
}

export default MapView;
