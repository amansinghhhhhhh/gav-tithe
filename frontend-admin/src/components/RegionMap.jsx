import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const REGIONS = {
    Konkan: { lat: 18.95, lng: 72.85 },
    Pune: { lat: 18.52, lng: 73.86 },
    Nashik: { lat: 19.99, lng: 73.79 },
    Aurangabad: { lat: 19.88, lng: 75.34 },
    Amravati: { lat: 20.93, lng: 77.75 },
    Nagpur: { lat: 21.15, lng: 79.09 },
};

function getRadius(count) {
    if (count === 0) return 8;
    if (count <= 3) return 12;
    if (count <= 8) return 18;
    if (count <= 15) return 24;
    return 30;
}

function getColor(count) {
    if (count === 0) return "#9ca3af";
    if (count <= 3) return "#34d399";
    if (count <= 8) return "#10b981";
    if (count <= 15) return "#059669";
    return "#047857";
}

function getRadiusForTier(high, medium, low) {
    const total = high + medium + low;
    return getRadius(total);
}

function FitBounds({ regions }) {
    const map = useMap();
    useEffect(() => {
        if (regions.length > 0) {
            const lats = regions.map((r) => REGIONS[r.region]?.lat).filter(Boolean);
            const lngs = regions.map((r) => REGIONS[r.region]?.lng).filter(Boolean);
            if (lats.length > 0) {
                const bounds = [
                    [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
                    [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5],
                ];
                map.fitBounds(bounds, { padding: [40, 40] });
            }
        }
    }, [map, regions]);
    return null;
}

export default function RegionMap({ byRegion, onRegionClick, selectedRegion }) {
    const regionData = byRegion || [];

    return (
        <div
            style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
        >
            <MapContainer
                center={[20.0, 74.0]}
                zoom={6}
                style={{ height: 420, width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds regions={regionData} />
                {regionData.map((r) => {
                    const coords = REGIONS[r.region];
                    if (!coords) return null;
                    const total = r.total;
                    const isSelected = selectedRegion === r.region;
                    return (
                        <CircleMarker
                            key={r.region}
                            center={[coords.lat, coords.lng]}
                            radius={getRadiusForTier(r.high, r.medium, r.low)}
                            pathOptions={{
                                color: isSelected ? "#142952" : getColor(total),
                                fillColor: getColor(total),
                                fillOpacity: 0.7,
                                weight: isSelected ? 3 : 1,
                            }}
                            eventHandlers={{
                                click: () => onRegionClick?.(r.region),
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                                <div style={{ fontFamily: "Segoe UI, sans-serif", minWidth: 140 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                        {r.region}
                                    </div>
                                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                                        Total: <b>{total}</b> registrations
                                    </div>
                                    <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                                        <span style={{ color: "#16a34a" }}>🟢 {r.high}</span>
                                        <span style={{ color: "#F97316" }}>🟡 {r.medium}</span>
                                        <span style={{ color: "#dc2626" }}>🔴 {r.low}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>
                                        Click to view details
                                    </div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
