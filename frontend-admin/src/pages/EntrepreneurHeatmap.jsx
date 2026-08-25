import { useEffect, useState } from "react";
import { getEntrepreneurHeatmap } from "../services/api";
import C from "../constants/colors";

const TIER_COLORS = {
    "High Potential": { bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
    "Medium Potential": { bg: "#fff7ed", color: "#F97316", dot: "#F97316" },
    "Needs Development": { bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
};

const REGION_BG = {
    0: "#f9fafb",
    1: "#ecfdf5",
    2: "#d1fae5",
    3: "#a7f3d0",
    4: "#6ee7b7",
    5: "#34d399",
    6: "#10b981",
};

function getHeatBg(count) {
    if (count === 0) return REGION_BG[0];
    if (count <= 2) return REGION_BG[1];
    if (count <= 5) return REGION_BG[2];
    if (count <= 10) return REGION_BG[3];
    if (count <= 15) return REGION_BG[4];
    return REGION_BG[5];
}

export default function EntrepreneurHeatmap() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [sortKey, setSortKey] = useState("score");
    const [sortDir, setSortDir] = useState("desc");

    useEffect(() => {
        getEntrepreneurHeatmap()
            .then((res) => {
                if (res.success) setData(res);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const filteredUsers = data?.users
        ? (selectedRegion
            ? data.users.filter((u) => u.region === selectedRegion)
            : data.users
          ).sort((a, b) => {
              const va = a[sortKey] ?? "";
              const vb = b[sortKey] ?? "";
              if (sortKey === "score") return sortDir === "asc" ? va - vb : vb - va;
              if (sortKey === "date") return sortDir === "asc" ? new Date(va) - new Date(vb) : new Date(vb) - new Date(va);
              return sortDir === "asc"
                ? String(va).localeCompare(String(vb))
                : String(vb).localeCompare(String(va));
          })
        : [];

    const sortIcon = (key) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "");

    if (loading) {
        return (
            <div style={{ padding: "60px 24px", textAlign: "center", color: C.textopa }}>
                Loading heatmap...
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ padding: "60px 24px", textAlign: "center", color: "#dc2626" }}>
                Failed to load heatmap data.
            </div>
        );
    }

    const { summary, byRegion } = data;

    return (
        <div style={{ padding: "28px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ color: C.navy, fontWeight: 800, marginBottom: 24 }}>
                🗺️ Entrepreneur Heatmap
            </h2>

            {/* ── Summary Cards ── */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
                {[
                    { label: "Total Users", value: summary.total, color: C.navy },
                    { label: "High Potential", value: summary.highPotential, color: "#16a34a" },
                    { label: "Medium Potential", value: summary.mediumPotential, color: "#F97316" },
                    { label: "Needs Development", value: summary.needsDevelopment, color: "#dc2626" },
                ].map((c) => (
                    <div
                        key={c.label}
                        style={{
                            background: C.white,
                            borderRadius: 12,
                            padding: "18px 24px",
                            flex: "1 1 150px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                            borderTop: `4px solid ${c.color}`,
                        }}
                    >
                        <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>
                            {c.value}
                        </div>
                        <div style={{ fontSize: 13, color: C.textopa }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Region Grid ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                    marginBottom: 28,
                }}
            >
                {byRegion.map((r) => (
                    <div
                        key={r.region}
                        onClick={() => setSelectedRegion(selectedRegion === r.region ? null : r.region)}
                        style={{
                            background: getHeatBg(r.total),
                            borderRadius: 14,
                            padding: "20px",
                            cursor: "pointer",
                            border: selectedRegion === r.region ? `3px solid ${C.navy}` : "3px solid transparent",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
                            {r.region}
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: C.navy, marginBottom: 10 }}>
                            {r.total}
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12, fontWeight: 600 }}>
                            <span style={{ color: "#16a34a" }}>🟢 {r.high}</span>
                            <span style={{ color: "#F97316" }}>🟡 {r.medium}</span>
                            <span style={{ color: "#dc2626" }}>🔴 {r.low}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── District Drill-down ── */}
            {selectedRegion && (
                <div
                    style={{
                        background: C.white,
                        borderRadius: 12,
                        padding: 20,
                        marginBottom: 28,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ color: C.navy, margin: 0, fontWeight: 700 }}>
                            📊 {selectedRegion} — District Breakdown
                        </h3>
                        <button
                            onClick={() => setSelectedRegion(null)}
                            style={{
                                padding: "6px 14px",
                                background: "#f0f0f0",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            ✕ Clear
                        </button>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                {["District", "Total", "High", "Medium", "Low"].map((h) => (
                                    <th
                                        key={h}
                                        style={{
                                            padding: "10px 12px",
                                            textAlign: "left",
                                            fontSize: 11,
                                            color: C.textopa,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {byRegion
                                .find((r) => r.region === selectedRegion)
                                ?.districts.map((d) => (
                                    <tr key={d.district} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 600, color: C.navy }}>
                                            {d.district}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                                            {d.total}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#16a34a" }}>
                                            {d.high}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#F97316" }}>
                                            {d.medium}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13, color: "#dc2626" }}>
                                            {d.low}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── User Table ── */}
            <div
                style={{
                    background: C.white,
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}
            >
                <h3 style={{ color: C.navy, marginBottom: 16, fontWeight: 700 }}>
                    📋 User Details {selectedRegion && `— ${selectedRegion}`} ({filteredUsers.length})
                </h3>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                {[
                                    { key: "name", label: "Name" },
                                    { key: "region", label: "Region" },
                                    { key: "district", label: "District" },
                                    { key: "taluka", label: "Taluka" },
                                    { key: "village", label: "Village" },
                                    { key: "score", label: "Score" },
                                    { key: "tier", label: "Tier" },
                                    { key: "date", label: "Date" },
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        style={{
                                            padding: "10px 12px",
                                            textAlign: "left",
                                            fontSize: 11,
                                            color: C.textopa,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            userSelect: "none",
                                        }}
                                    >
                                        {col.label}{sortIcon(col.key)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => {
                                const tierStyle = TIER_COLORS[u.tier] || TIER_COLORS["Needs Development"];
                                return (
                                    <tr key={u._id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 600, color: C.navy }}>
                                            {u.name || "—"}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13 }}>
                                            {u.region}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13 }}>
                                            {u.district || "—"}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13 }}>
                                            {u.taluka || "—"}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13 }}>
                                            {u.village || "—"}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                                            {u.score}/15
                                        </td>
                                        <td style={{ padding: "10px 12px" }}>
                                            <span
                                                style={{
                                                    background: tierStyle.bg,
                                                    color: tierStyle.color,
                                                    padding: "3px 10px",
                                                    borderRadius: 20,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {u.tier}
                                            </span>
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13, color: C.textopa }}>
                                            {u.date
                                                ? new Date(u.date).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{
                                            padding: "24px",
                                            textAlign: "center",
                                            color: C.textopa,
                                            fontSize: 14,
                                        }}
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
