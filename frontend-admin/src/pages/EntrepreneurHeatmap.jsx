import { useEffect, useState, useMemo } from "react";
import { getEntrepreneurHeatmap } from "../services/api";
import C from "../constants/colors";

const TIER_COLORS = {
    "High Potential": { bg: "#dcfce7", color: "#16a34a" },
    "Medium Potential": { bg: "#fff7ed", color: "#F97316" },
    "Needs Development": { bg: "#fee2e2", color: "#dc2626" },
};

const selectStyle = {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #d1d5db",
    fontSize: 14,
    fontWeight: 600,
    color: C.navy,
    background: "#fff",
    cursor: "pointer",
    minWidth: 160,
};

export default function EntrepreneurHeatmap() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selDist, setSelDist] = useState("");
    const [selTaluka, setSelTaluka] = useState("");
    const [selVillage, setSelVillage] = useState("");
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

    // Cascade: district → taluka options
    const talukaOptions = useMemo(() => {
        if (!selDist || !data) return [];
        const set = new Set();
        data.byTaluka.forEach((t) => {
            if (t.district === selDist) set.add(t.taluka);
        });
        return [...set].sort();
    }, [selDist, data]);

    // Cascade: district + taluka → village options
    const villageOptions = useMemo(() => {
        if (!selDist || !selTaluka || !data) return [];
        const set = new Set();
        data.byVillage.forEach((v) => {
            if (v.district === selDist && v.taluka === selTaluka) set.add(v.village);
        });
        return [...set].sort();
    }, [selDist, selTaluka, data]);

    // Filter users
    const filteredUsers = useMemo(() => {
        if (!data?.users) return [];
        return data.users.filter((u) => {
            if (selDist && u.district !== selDist) return false;
            if (selTaluka && u.taluka !== selTaluka) return false;
            if (selVillage && u.village !== selVillage) return false;
            return true;
        });
    }, [data, selDist, selTaluka, selVillage]);

    // District bar chart data (filtered by current selection)
    const barData = useMemo(() => {
        if (!data) return [];
        if (selDist && selTaluka) {
            // Show village-wise
            return data.byVillage
                .filter((v) => v.district === selDist && v.taluka === selTaluka)
                .map((v) => ({ label: v.village, total: v.total, high: v.high, medium: v.medium, low: v.low }));
        }
        if (selDist) {
            // Show taluka-wise
            return data.byTaluka
                .filter((t) => t.district === selDist)
                .map((t) => ({ label: t.taluka, total: t.total, high: t.high, medium: t.medium, low: t.low }));
        }
        // Show district-wise
        return data.byDistrict.map((d) => ({ label: d.district, total: d.total, high: d.high, medium: d.medium, low: d.low }));
    }, [data, selDist, selTaluka]);

    const maxBar = Math.max(...barData.map((b) => b.total), 1);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("desc"); }
    };

    const sortIcon = (key) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "");

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        if (sortKey === "score") return sortDir === "asc" ? va - vb : vb - va;
        if (sortKey === "date") return sortDir === "asc" ? new Date(va) - new Date(vb) : new Date(vb) - new Date(va);
        return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

    const clearFilters = () => {
        setSelDist("");
        setSelTaluka("");
        setSelVillage("");
    };

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

    const { summary } = data;

    return (
        <div style={{ padding: "28px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ color: C.navy, fontWeight: 800, marginBottom: 24 }}>
                🗺️ Entrepreneur Heatmap
            </h2>

            {/* ── Summary Cards ── */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
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
                        <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: 13, color: C.textopa }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div
                style={{
                    background: C.white,
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Filters:</span>
                <select
                    style={selectStyle}
                    value={selDist}
                    onChange={(e) => { setSelDist(e.target.value); setSelTaluka(""); setSelVillage(""); }}
                >
                    <option value="">All Districts</option>
                    {data.byDistrict.map((d) => (
                        <option key={d.district} value={d.district}>{d.district} ({d.total})</option>
                    ))}
                </select>
                <select
                    style={{ ...selectStyle, opacity: selDist ? 1 : 0.5 }}
                    value={selTaluka}
                    disabled={!selDist}
                    onChange={(e) => { setSelTaluka(e.target.value); setSelVillage(""); }}
                >
                    <option value="">All Talukas</option>
                    {talukaOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <select
                    style={{ ...selectStyle, opacity: selTaluka ? 1 : 0.5 }}
                    value={selVillage}
                    disabled={!selTaluka}
                    onChange={(e) => setSelVillage(e.target.value)}
                >
                    <option value="">All Villages</option>
                    {villageOptions.map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
                {(selDist || selTaluka || selVillage) && (
                    <button
                        onClick={clearFilters}
                        style={{
                            padding: "8px 16px",
                            background: "#f0f0f0",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            color: C.textopa,
                        }}
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* ── Bar Chart ── */}
            <div
                style={{
                    background: C.white,
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 24,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}
            >
                <h3 style={{ color: C.navy, margin: "0 0 16px", fontWeight: 700, fontSize: 14 }}>
                    📊 {selTaluka ? `${selTaluka} — Village-wise` : selDist ? `${selDist} — Taluka-wise` : "District-wise Breakdown"}
                </h3>
                {barData.length === 0 ? (
                    <div style={{ color: C.textopa, fontSize: 13, padding: 12 }}>No data available.</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {barData.map((b) => (
                            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: C.navy, textAlign: "right", flexShrink: 0 }}>
                                    {b.label}
                                </div>
                                <div style={{ flex: 1, display: "flex", height: 26, borderRadius: 6, overflow: "hidden", background: "#f3f4f6" }}>
                                    <div style={{ width: `${(b.high / maxBar) * 100}%`, background: "#16a34a", transition: "width 0.3s" }} />
                                    <div style={{ width: `${(b.medium / maxBar) * 100}%`, background: "#F97316", transition: "width 0.3s" }} />
                                    <div style={{ width: `${(b.low / maxBar) * 100}%`, background: "#dc2626", transition: "width 0.3s" }} />
                                </div>
                                <div style={{ width: 40, fontSize: 13, fontWeight: 700, color: C.navy, textAlign: "right" }}>
                                    {b.total}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── User Table ── */}
            <div
                style={{
                    background: C.white,
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}
            >
                <h3 style={{ color: C.navy, marginBottom: 16, fontWeight: 700, fontSize: 14 }}>
                    📋 User Details ({sortedUsers.length})
                </h3>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                {[
                                    { key: "name", label: "Name" },
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
                            {sortedUsers.map((u) => {
                                const ts = TIER_COLORS[u.tier] || TIER_COLORS["Needs Development"];
                                return (
                                    <tr key={u._id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 600, color: C.navy }}>
                                            {u.name || "—"}
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13 }}>{u.district || "—"}</td>
                                        <td style={{ padding: "10px 12px", fontSize: 13 }}>{u.taluka || "—"}</td>
                                        <td style={{ padding: "10px 12px", fontSize: 13 }}>{u.village || "—"}</td>
                                        <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>{u.score}/15</td>
                                        <td style={{ padding: "10px 12px" }}>
                                            <span style={{
                                                background: ts.bg,
                                                color: ts.color,
                                                padding: "3px 10px",
                                                borderRadius: 20,
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}>
                                                {u.tier}
                                            </span>
                                        </td>
                                        <td style={{ padding: "10px 12px", fontSize: 13, color: C.textopa }}>
                                            {u.date
                                                ? new Date(u.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                                : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedUsers.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ padding: 24, textAlign: "center", color: C.textopa, fontSize: 14 }}>
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
