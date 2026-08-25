import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DISTRICT_COORDS = {
    "Ahmednagar": { lat: 19.09, lng: 74.74 },
    "Akola": { lat: 20.71, lng: 76.99 },
    "Amravati": { lat: 20.93, lng: 77.75 },
    "Aurangabad": { lat: 19.88, lng: 75.34 },
    "Beed": { lat: 18.99, lng: 75.76 },
    "Bhandara": { lat: 21.17, lng: 79.65 },
    "Buldhana": { lat: 20.53, lng: 76.18 },
    "Chandrapur": { lat: 19.96, lng: 79.30 },
    "Dhule": { lat: 20.90, lng: 74.78 },
    "Gadchiroli": { lat: 19.50, lng: 80.00 },
    "Gondia": { lat: 21.46, lng: 80.20 },
    "Hingoli": { lat: 19.72, lng: 77.78 },
    "Jalgaon": { lat: 21.01, lng: 75.96 },
    "Jalna": { lat: 19.84, lng: 75.89 },
    "Kolhapur": { lat: 16.70, lng: 74.24 },
    "Latur": { lat: 18.40, lng: 76.56 },
    "Mumbai City": { lat: 18.94, lng: 72.84 },
    "Mumbai Suburban": { lat: 19.06, lng: 72.88 },
    "Nagpur": { lat: 21.15, lng: 79.09 },
    "Nanded": { lat: 19.14, lng: 77.32 },
    "Nandurbar": { lat: 21.37, lng: 74.24 },
    "Nashik": { lat: 19.99, lng: 73.79 },
    "Osmanabad": { lat: 18.18, lng: 76.03 },
    "Palghar": { lat: 19.69, lng: 72.80 },
    "Parbhani": { lat: 19.27, lng: 76.78 },
    "Pune": { lat: 18.52, lng: 73.86 },
    "Raigad": { lat: 18.25, lng: 73.32 },
    "Ratnagiri": { lat: 16.99, lng: 73.30 },
    "Sangli": { lat: 16.85, lng: 74.56 },
    "Satara": { lat: 17.68, lng: 73.99 },
    "Sindhudurg": { lat: 16.00, lng: 73.68 },
    "Solapur": { lat: 17.66, lng: 75.91 },
    "Thane": { lat: 19.22, lng: 72.98 },
    "Wardha": { lat: 20.74, lng: 78.60 },
    "Washim": { lat: 20.11, lng: 77.13 },
    "Yavatmal": { lat: 20.39, lng: 78.13 },
};

function getRadius(count) {
    if (count === 0) return 6;
    if (count <= 3) return 10;
    if (count <= 8) return 15;
    if (count <= 15) return 22;
    return 28;
}

function getColor(count) {
    if (count === 0) return "#9ca3af";
    if (count <= 3) return "#34d399";
    if (count <= 8) return "#10b981";
    if (count <= 15) return "#059669";
    return "#047857";
}

function FitBounds({ byDistrict }) {
    const map = useMap();
    useEffect(() => {
        if (byDistrict && byDistrict.length > 0) {
            const lats = byDistrict.map((d) => DISTRICT_COORDS[d.district]?.lat).filter(Boolean);
            const lngs = byDistrict.map((d) => DISTRICT_COORDS[d.district]?.lng).filter(Boolean);
            if (lats.length > 0) {
                const bounds = [
                    [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
                    [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5],
                ];
                map.fitBounds(bounds, { padding: [40, 40] });
            }
        }
    }, [map, byDistrict]);
    return null;
}

export default function RegionMap({ byDistrict, onDistrictClick, selectedDistrict }) {
    const data = byDistrict || [];
    return (
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <MapContainer center={[20.0, 76.0]} zoom={6} style={{ height: 420, width: "100%" }} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds byDistrict={data} />
                {data.map((d) => {
                    const coords = DISTRICT_COORDS[d.district];
                    if (!coords) return null;
                    const isSelected = selectedDistrict === d.district;
                    return (
                        <CircleMarker
                            key={d.district}
                            center={[coords.lat, coords.lng]}
                            radius={getRadius(d.total)}
                            pathOptions={{
                                color: isSelected ? "#142952" : getColor(d.total),
                                fillColor: getColor(d.total),
                                fillOpacity: 0.7,
                                weight: isSelected ? 3 : 1,
                            }}
                            eventHandlers={{ click: () => onDistrictClick?.(d.district) }}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                                <div style={{ fontFamily: "Segoe UI, sans-serif", minWidth: 140 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{d.district}</div>
                                    <div style={{ fontSize: 12, marginBottom: 4 }}>Total: <b>{d.total}</b> registrations</div>
                                    <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                                        <span style={{ color: "#16a34a" }}>High: {d.high}</span>
                                        <span style={{ color: "#F97316" }}>Med: {d.medium}</span>
                                        <span style={{ color: "#dc2626" }}>Low: {d.low}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>Click to filter</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
