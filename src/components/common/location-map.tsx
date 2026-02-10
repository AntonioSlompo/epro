'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in React Leaflet
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


interface LocationMapProps {
    latitude?: number;
    longitude?: number;
    popupText?: string;
    onPositionChange?: (lat: number, lng: number) => void;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function ClickHandler({ onPositionChange }: { onPositionChange?: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            if (onPositionChange) {
                onPositionChange(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

export default function LocationMap({ latitude, longitude, popupText, onPositionChange }: LocationMapProps) {
    // Default to Brazil center if no coordinates provided
    const hasCoordinates = latitude !== undefined && longitude !== undefined;
    const position: [number, number] = hasCoordinates
        ? [latitude!, longitude!]
        : [-14.2350, -51.9253];

    // Zoom 16 for specific address, 4 for country view
    const zoom = hasCoordinates ? 16 : 4;

    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null && onPositionChange) {
                    const latLng = marker.getLatLng();
                    onPositionChange(latLng.lat, latLng.lng);
                }
            },
        }),
        [onPositionChange],
    );

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            style={{ height: '100%', width: '100%', minHeight: '300px', borderRadius: '0.5rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hasCoordinates && (
                <Marker
                    draggable={!!onPositionChange}
                    eventHandlers={eventHandlers}
                    position={position}
                    icon={icon}
                    ref={markerRef}
                >
                    <Popup>
                        {popupText || "Endereço selecionado"}
                    </Popup>
                </Marker>
            )}
            <ClickHandler onPositionChange={onPositionChange} />
            <MapUpdater center={position} zoom={zoom} />
        </MapContainer>
    );
}
