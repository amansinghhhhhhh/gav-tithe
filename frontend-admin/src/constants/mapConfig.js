// ── Maharashtra map tuning — SAB kuch ek jagah (requirement: configurable thresholds) ──

// Activity % = (high + medium) / total * 100 → status tier
export const THRESHOLDS = { high: 70, medium: 30 };

export const STATUS_COLORS = {
    high: "#F97316", // High activity — orange
    medium: "#16a34a", // Medium activity — green
    low: "#3b82f6", // Low activity — blue
};

export const STATUS_LABELS = { high: "High", medium: "Medium", low: "Low" };

export const MAP_STYLE = {
    districtFill: "#ffffff",
    districtBorder: "#d1d5db",
    hoverFill: "#f1f5f9",
    hoverBorder: "#94a3b8",
    selectedFill: "#dbeafe",
    selectedBorder: "#142952",
    markerStroke: "#ffffff",
};

// API district name → GeoJSON district name (jo geojson me alag naam se hai)
export const DISTRICT_MAPPING = {
    "Mumbai City": "Mumbai",
};

export function toGeoDistrict(name) {
    return DISTRICT_MAPPING[name] || name;
}

export function activityPct(d) {
    if (!d || !d.total) return 0;
    return ((d.high + d.medium) / d.total) * 100;
}

export function statusTier(d) {
    const pct = activityPct(d);
    if (pct >= THRESHOLDS.high) return "high";
    if (pct >= THRESHOLDS.medium) return "medium";
    return "low";
}

// Circle marker radius (px) — sqrt scale: count badhne pe size dheere-dheere badhe
export function markerRadius(total, maxTotal) {
    if (!total) return 6;
    return 8 + Math.sqrt(total / (maxTotal || 1)) * 18;
}
