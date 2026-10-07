import { useEffect, useMemo, useState } from "react";
import { MapContainer, GeoJSON, CircleMarker, Tooltip, Pane, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import geoData from "../assets/maharashtraDistricts.js";
import C from "../constants/colors";
import { override } from "../constants/placeRename";
import {
    STATUS_COLORS,
    STATUS_LABELS,
    MAP_STYLE,
    THRESHOLDS,
    toGeoDistrict,
    activityPct,
    statusTier,
    markerRadius,
} from "../constants/mapConfig";

const FEATURES = geoData.features;
const GEO_NAMES = new Set(FEATURES.map((f) => f.properties.district));

function computeBounds() {
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    const walk = (c) => {
        if (typeof c[0] === "number") {
            if (c[0] < minLng) minLng = c[0];
            if (c[0] > maxLng) maxLng = c[0];
            if (c[1] < minLat) minLat = c[1];
            if (c[1] > maxLat) maxLat = c[1];
        } else c.forEach(walk);
    };
    FEATURES.forEach((f) => walk(f.geometry.coordinates));
    return [[minLat, minLng], [maxLat, maxLng]];
}
const MH_BOUNDS = computeBounds();

function centroidOf(feature) {
    const g = feature.geometry;
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    let best = null;
    let bestArea = -1;
    for (const poly of polys) {
        const ring = poly[0];
        let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
        for (const p of ring) {
            if (p[0] < minx) minx = p[0];
            if (p[0] > maxx) maxx = p[0];
            if (p[1] < miny) miny = p[1];
            if (p[1] > maxy) maxy = p[1];
        }
        const area = (maxx - minx) * (maxy - miny);
        if (area > bestArea) {
            bestArea = area;
            best = [(miny + maxy) / 2, (minx + maxx) / 2];
        }
    }
    return best;
}
const CENTROIDS = Object.fromEntries(FEATURES.map((f) => [f.properties.district, centroidOf(f)]));

function FitBounds() {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(MH_BOUNDS, { padding: [24, 24] });
    }, [map]);
    return null;
}

function tooltipHtml(displayName, stats) {
    if (!stats) {
        return (
            `<div style="font-family:Segoe UI,sans-serif;min-width:130px">` +
            `<div style="font-weight:700;font-size:13px">${displayName}</div>` +
            `<div style="font-size:12px;color:#94a3b8">No applications yet</div></div>`
        );
    }
    const tier = statusTier(stats);
    const pct = activityPct(stats);
    return (
        `<div style="font-family:Segoe UI,sans-serif;min-width:150px">` +
        `<div style="font-weight:700;font-size:13px;margin-bottom:4px">${displayName}</div>` +
        `<div style="font-size:12px">Applications: <b>${stats.total}</b></div>` +
        `<div style="font-size:12px">Active ideas: <b>${stats.high + stats.medium}</b></div>` +
        `<div style="font-size:12px;margin-top:2px">Activity: <b>${pct.toFixed(0)}%</b> · ` +
        `<span style="color:${STATUS_COLORS[tier]};font-weight:700">${STATUS_LABELS[tier]}</span></div>` +
        `</div>`
    );
}

function MapPlaceholder({ children, isError }) {
    return (
        <div
            style={{
                height: "min(900px, 90vh)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                color: isError ? "#dc2626" : C.textopa,
                fontSize: 14,
                fontWeight: 600,
            }}
        >
            {children}
        </div>
    );
}

export default function MaharashtraMap({ data = [], loading = false, error = false, selectedDistrict = "", onApplyFilter }) {
    const [hoverGeo, setHoverGeo] = useState(null);
    const [panelGeo, setPanelGeo] = useState(null);

    const { statsByGeo, unmapped, sig, maxTotal } = useMemo(() => {
        const map = new Map();
        const unmapped = [];
        for (const d of data) {
            const g = toGeoDistrict(d.district);
            if (!GEO_NAMES.has(g)) {
                unmapped.push(d.district);
                continue;
            }
            const prev = map.get(g) || { total: 0, high: 0, medium: 0, low: 0, apiDistricts: [] };
            prev.total += d.total;
            prev.high += d.high;
            prev.medium += d.medium;
            prev.low += d.low;
            prev.apiDistricts.push(d.district);
            map.set(g, prev);
        }
        let max = 1;
        map.forEach((v) => {
            if (v.total > max) max = v.total;
        });
        const sig = data.map((d) => `${d.district}:${d.total}:${d.high}:${d.medium}:${d.low}`).join("|");
        return { statsByGeo: map, unmapped, sig, maxTotal: max };
    }, [data]);

    const features = useMemo(
        () => ({
            type: "FeatureCollection",
            features: FEATURES.map((f) => ({
                ...f,
                properties: { ...f.properties, stats: statsByGeo.get(f.properties.district) || null },
            })),
        }),
        [statsByGeo]
    );

    const selectedGeo = selectedDistrict ? toGeoDistrict(selectedDistrict) : null;

    const districtStyle = (feature) => {
        const name = feature.properties.district;
        const isHover = hoverGeo === name;
        const isSel = selectedGeo === name;
        return {
            fillColor: isSel ? MAP_STYLE.selectedFill : isHover ? MAP_STYLE.hoverFill : MAP_STYLE.districtFill,
            fillOpacity: 1,
            color: isSel ? MAP_STYLE.selectedBorder : isHover ? MAP_STYLE.hoverBorder : MAP_STYLE.districtBorder,
            weight: isSel ? 2.5 : isHover ? 2 : 1,
            fillRule: "evenodd",
        };
    };

    const onEachFeature = (feature, layer) => {
        const name = feature.properties.district;
        const stats = feature.properties.stats;
        const apiName = stats?.apiDistricts?.[0] || name;
        const displayName = override("district", "en", apiName) || apiName;
        layer.bindTooltip(tooltipHtml(displayName, stats), { sticky: true, direction: "top", opacity: 0.95 });
        layer.on({
            mouseover: () => setHoverGeo(name),
            mouseout: () => setHoverGeo(null),
            click: () => setPanelGeo((prev) => (prev === name ? null : name)),
        });
    };

    if (loading) return <MapPlaceholder>Loading map…</MapPlaceholder>;
    if (error) return <MapPlaceholder isError>Failed to load map data.</MapPlaceholder>;

    const panelStats = panelGeo ? statsByGeo.get(panelGeo) || null : null;
    const panelApiName = panelStats?.apiDistricts?.[0] || panelGeo;
    const panelName = panelApiName ? (override("district", "en", panelApiName) || panelApiName) : "";
    const panelTier = panelStats ? statusTier(panelStats) : null;
    const panelPct = panelStats ? activityPct(panelStats) : 0;

    return (
        <div>
            <div
                style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <MapContainer
                    center={[19.5, 75.5]}
                    zoom={7}
                    minZoom={6}
                    maxBounds={MH_BOUNDS}
                    maxBoundsViscosity={1.0}
                    style={{ height: "min(900px, 90vh)", width: "100%", background: "#fff" }}
                    scrollWheelZoom={false}
                >
                    <FitBounds />
                    <GeoJSON
                        key={sig}
                        data={features}
                        style={districtStyle}
                        onEachFeature={onEachFeature}
                    />
                    <Pane name="countMarkers" style={{ zIndex: 620 }}>
                        {[...statsByGeo.entries()].map(([g, s]) => {
                            const tier = statusTier(s);
                            const apiName = s.apiDistricts[0];
                            const displayName = override("district", "en", apiName) || apiName;
                            return (
                                <CircleMarker
                                    key={g}
                                    center={CENTROIDS[g]}
                                    radius={markerRadius(s.total, maxTotal)}
                                    pathOptions={{
                                        color: MAP_STYLE.markerStroke,
                                        weight: 2,
                                        fillColor: STATUS_COLORS[tier],
                                        fillOpacity: 0.9,
                                    }}
                                    eventHandlers={{
                                        mouseover: () => setHoverGeo(g),
                                        mouseout: () => setHoverGeo(null),
                                        click: () => setPanelGeo((prev) => (prev === g ? null : g)),
                                    }}
                                >
                                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                                        <div dangerouslySetInnerHTML={{ __html: tooltipHtml(displayName, s) }} />
                                    </Tooltip>
                                </CircleMarker>
                            );
                        })}
                    </Pane>
                </MapContainer>

                {/* ── Legend ── */}
                <div
                    style={{
                        position: "absolute",
                        left: 12,
                        bottom: 12,
                        zIndex: 1000,
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 11,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        lineHeight: 1.7,
                    }}
                >
                    <div style={{ fontWeight: 700, color: C.navy, marginBottom: 2 }}>Status</div>
                    <div>
                        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS.high, marginRight: 6 }} />
                        <span style={{ color: "#334155" }}>High (≥{THRESHOLDS.high}%)</span>
                    </div>
                    <div>
                        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS.medium, marginRight: 6 }} />
                        <span style={{ color: "#334155" }}>Medium ({THRESHOLDS.medium}–{THRESHOLDS.high - 1}%)</span>
                    </div>
                    <div>
                        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS.low, marginRight: 6 }} />
                        <span style={{ color: "#334155" }}>Low (&lt;{THRESHOLDS.medium}%)</span>
                    </div>
                    <div style={{ color: C.textopa, marginTop: 2 }}>○ Circle size = applications</div>
                </div>

                {/* ── Empty state ── */}
                {data.length === 0 && (
                    <div
                        style={{
                            position: "absolute",
                            top: 12,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1000,
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            padding: "6px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.textopa,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                    >
                        No applications yet
                    </div>
                )}

                {/* ── Detail panel ── */}
                {panelGeo && (
                    <div
                        className="modal-rise"
                        style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            zIndex: 1000,
                            width: 260,
                            maxWidth: "calc(100% - 24px)",
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: 16,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                            textAlign: "left",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>{panelName}</div>
                            <button
                                onClick={() => setPanelGeo(null)}
                                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, color: C.textopa, lineHeight: 1, padding: 0 }}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {panelStats ? (
                            <>
                                <div style={{ fontSize: 12, color: "#334155", marginTop: 10 }}>
                                    Applications: <b style={{ color: C.navy }}>{panelStats.total}</b>
                                </div>
                                <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
                                    Active ideas: <b style={{ color: C.navy }}>{panelStats.high + panelStats.medium}</b>
                                </div>
                                <div style={{ display: "flex", gap: 8, fontSize: 11, marginTop: 8 }}>
                                    <span style={{ color: "#16a34a" }}>High: {panelStats.high}</span>
                                    <span style={{ color: "#F97316" }}>Medium: {panelStats.medium}</span>
                                    <span style={{ color: "#3b82f6" }}>Low: {panelStats.low}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                                    <span style={{ fontSize: 12, color: "#334155" }}>
                                        Activity: <b>{panelPct.toFixed(0)}%</b>
                                    </span>
                                    <span
                                        style={{
                                            background: panelTier === "high" ? "#fff7ed" : panelTier === "medium" ? "#dcfce7" : "#eff6ff",
                                            color: STATUS_COLORS[panelTier],
                                            fontSize: 11,
                                            fontWeight: 700,
                                            padding: "2px 10px",
                                            borderRadius: 20,
                                        }}
                                    >
                                        {STATUS_LABELS[panelTier]}
                                    </span>
                                </div>
                                {onApplyFilter && (
                                    <button
                                        onClick={() => onApplyFilter(panelStats.apiDistricts[0])}
                                        style={{
                                            marginTop: 12,
                                            width: "100%",
                                            padding: "8px 12px",
                                            background: C.navy,
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Apply Filter →
                                    </button>
                                )}
                            </>
                        ) : (
                            <div style={{ fontSize: 12, color: C.textopa, marginTop: 8 }}>No applications yet in this district.</div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Unmapped districts (API me hain par map par nahi) ── */}
            {unmapped.length > 0 && (
                <div style={{ fontSize: 11, color: C.textopa, marginTop: 6 }}>
                    Not shown on map: {unmapped.join(", ")}
                </div>
            )}
        </div>
    );
}
