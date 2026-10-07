import { useEffect, useState, useMemo } from "react";
import { getEntrepreneurHeatmap } from "../services/api";
import MaharashtraMap from "../components/MaharashtraMap";
import C from "../constants/colors";
import { override } from "../constants/placeRename";

const renameDist = (s) => override("district", "en", s) || s;
const renameTaluka = (s) => override("taluka", "en", s) || s;

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

    useEffect(() => {
        getEntrepreneurHeatmap()
            .then((res) => {
                if (res.success) setData(res);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Cascade: district → taluka options (with registration count)
    const talukaOptions = useMemo(() => {
        if (!selDist || !data) return [];
        const map = new Map();
        data.byTaluka.forEach((t) => {
            if (t.district !== selDist) return;
            map.set(t.taluka, (map.get(t.taluka) || 0) + t.total);
        });
        return [...map.entries()]
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [selDist, data]);

    // Cascade: district + taluka → village options (with registration count)
    const villageOptions = useMemo(() => {
        if (!selDist || !selTaluka || !data) return [];
        const map = new Map();
        data.byVillage.forEach((v) => {
            if (v.district !== selDist || v.taluka !== selTaluka) return;
            map.set(v.village, (map.get(v.village) || 0) + v.total);
        });
        return [...map.entries()]
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [selDist, selTaluka, data]);

    // District-wise counts honoring active filters (map ke markers live update)
    const filteredByDistrict = useMemo(() => {
        if (!data?.users) return [];
        const map = new Map();
        for (const u of data.users) {
            if (selDist && u.district !== selDist) continue;
            if (selTaluka && u.taluka !== selTaluka) continue;
            if (selVillage && u.village !== selVillage) continue;
            if (!u.district) continue;
            const prev = map.get(u.district) || { district: u.district, total: 0, high: 0, medium: 0, low: 0 };
            prev.total++;
            if (u.tier === "High Potential") prev.high++;
            else if (u.tier === "Medium Potential") prev.medium++;
            else prev.low++;
            map.set(u.district, prev);
        }
        return [...map.values()].sort((a, b) => b.total - a.total);
    }, [data, selDist, selTaluka, selVillage]);

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
        <>
            <div style={{ padding: "28px 24px", maxWidth: 1400, margin: "0 auto" }}>
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

            {/* ── Filters (map se upar) ── */}
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
                        <option key={d.district} value={d.district}>{renameDist(d.district)} ({d.total})</option>
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
                        <option key={t.name} value={t.name}>{renameTaluka(t.name)} ({t.total})</option>
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
                        <option key={v.name} value={v.name}>{v.name} ({v.total})</option>
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
        </div>

            {/* ── Map (full width, maxWidth se bahar) ── */}
            <div style={{ width: "100%", padding: "0 12px 40px" }}>
                <MaharashtraMap
                    data={filteredByDistrict}
                    selectedDistrict={selDist}
                    onApplyFilter={(dist) => {
                        setSelDist(dist);
                        setSelTaluka("");
                        setSelVillage("");
                    }}
                />
            </div>
        </>
    );
}
