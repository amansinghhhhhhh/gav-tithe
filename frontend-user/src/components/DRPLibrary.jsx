import { useState, useEffect, useMemo } from "react";
import C from "../constants/colors";
import { useLang } from "../context/LangContext";
import { Spinner } from "./shared/Spinner";
import { getDRPEntries } from "../services/api";
import { districts } from "../constants/maharashtraData";
import { districtMr } from "../constants/maharashtraDataMr";
import { override } from "../constants/placeRename";

const SECTORS = [
  "Agro-Processing",
  "Food Processing",
  "Dairy",
  "Manufacturing",
  "Handicraft",
  "Textile",
  "Animal Husbandry",
  "Herbal/Ayurvedic",
  "Agriculture",
  "Apiculture",
  "Renewable Energy",
  "Infrastructure",
  "Service",
];

const INVESTMENT_RANGES = [
  "All",
  "₹0 - ₹1 Lakh",
  "₹1L - ₹5 Lakh",
  "₹5L - ₹25 Lakh",
  "₹25 Lakh+",
];

const RANGES = {
  "₹0 - ₹1 Lakh": { min: 0, max: 1 },
  "₹1L - ₹5 Lakh": { min: 1, max: 5 },
  "₹5L - ₹25 Lakh": { min: 5, max: 25 },
  "₹25 Lakh+": { min: 25, max: 9999 },
};

const SECTOR_COLORS = {
  "Manufacturing": "#2563eb",
  "Food Processing": "#ea580c",
  "Dairy": "#0891b2",
  "Textile": "#7c3aed",
  "Herbal/Ayurvedic": "#16a34a",
  "Renewable Energy": "#ca8a04",
  "Animal Husbandry": "#dc2626",
  "Agro-Processing": "#65a30d",
  "Infrastructure": "#475569",
  "Service": "#0d9488",
  "Handicraft": "#c026d3",
  "Agriculture": "#15803d",
  "Apiculture": "#d97706",
};

const TAG_COLORS = [
  "#1e40af", "#7c3aed", "#be185d", "#0f766e",
  "#b45309", "#166534", "#9333ea", "#c2410c",
];

export default function DRPLibrary() {
  const { lang } = useLang();
  const distLabel = (d) => override("district", lang, d) || (lang === "mr" ? districtMr[d] || d : d);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [investmentRange, setInvestmentRange] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getDRPEntries();
        if (alive && res.success) setEntries(res.entries);
      } catch (err) {
        console.error("DRP load error:", err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    const range = investmentRange !== "All" ? RANGES[investmentRange] : null;
    return entries.filter((e) => {
      if (selectedSectors.length > 0 && !selectedSectors.includes(e.sector)) return false;
      if (selectedDistrict !== "All Districts" && e.location !== selectedDistrict) return false;
      if (range && !(e.investmentMin <= range.max && e.investmentMax >= range.min)) return false;
      if (q) {
        const hay = `${e.variantName} ${e.sector} ${e.odop} ${e.category || ""} ${e.location} ${(e.tags || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, search, selectedSectors, investmentRange, selectedDistrict]);

  const toggleSector = (sector) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSectors([]);
    setInvestmentRange("All");
    setSelectedDistrict("All Districts");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedSectors.length > 0 ||
    investmentRange !== "All" ||
    selectedDistrict !== "All Districts";

  const getTagColor = (tag) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
  };

  return (
    <div className="drp-split" style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
      {/* ── Filter Sidebar ── */}
      <div
        style={{
          width: showFilters ? 270 : 0,
          minWidth: showFilters ? 270 : 0,
          flexShrink: 0,
          overflowX: "hidden",
          overflowY: "auto",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            padding: "20px",
          }}
        >
          {/* Filter Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 16,
                  borderRadius: 2,
                  background: C.orange,
                }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: C.navy,
                }}
              >
                {lang === "mr" ? "फिल्टर्स" : "Filters"}
              </h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: C.orange,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {lang === "mr" ? "साफ करा" : "Clear All"}
              </button>
            )}
          </div>

          {/* Sector Filter */}
          <div
            style={{
              marginBottom: 12,
              background: "rgba(20, 41, 82, 0.05)",
              border: "1.5px solid rgba(20, 41, 82, 0.10)",
              borderRadius: 12,
              padding: "14px 14px 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: C.navy,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                🏭
              </span>
              <h4
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color: C.navy,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {lang === "mr" ? "क्षेत्र" : "Sector"}
              </h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SECTORS.map((sector) => {
                const isActive = selectedSectors.includes(sector);
                return (
                  <label
                    key={sector}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: isActive ? `${SECTOR_COLORS[sector]}10` : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleSector(sector)}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: `2px solid ${isActive ? SECTOR_COLORS[sector] : "#d1d5db"}`,
                        background: isActive ? SECTOR_COLORS[sector] : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {isActive && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2.5 6L5 8.5L9.5 3.5"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? SECTOR_COLORS[sector] : "#4b5563",
                      }}
                    >
                      {sector}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Investment Range */}
          <div
            style={{
              marginBottom: 12,
              background: "rgba(249, 115, 22, 0.07)",
              border: "1.5px solid rgba(249, 115, 22, 0.15)",
              borderRadius: 12,
              padding: "14px 14px 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: C.orange,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                💰
              </span>
              <h4
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color: C.orange,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {lang === "mr" ? "गुंतवणूक श्रेणी" : "Investment Range"}
              </h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {INVESTMENT_RANGES.map((range) => {
                const isActive = investmentRange === range;
                return (
                  <label
                    key={range}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      padding: "7px 10px",
                      borderRadius: 8,
                      background: isActive ? `${C.orange}10` : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="radio"
                      name="investmentRange"
                      checked={isActive}
                      onChange={() => setInvestmentRange(range)}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${isActive ? C.orange : "#d1d5db"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: C.orange,
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? C.orange : "#4b5563",
                      }}
                    >
                      {range}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* District Filter */}
          <div
            style={{
              background: "rgba(22, 163, 74, 0.07)",
              border: "1.5px solid rgba(22, 163, 74, 0.15)",
              borderRadius: 12,
              padding: "14px 14px 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "#16a34a",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                📍
              </span>
              <h4
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#15803d",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {lang === "mr" ? "जिल्हा / ODOP" : "District / ODOP"}
              </h4>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="All Districts">
                {lang === "mr" ? "सर्व जिल्हे" : "All Districts"}
              </option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {distLabel(d)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {/* Hero Header */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(125deg, #142952 0%, #1d3f7a 55%, #16305f 100%)",
            borderRadius: 16,
            padding: "26px 28px",
            marginBottom: 18,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(20, 41, 82, 0.25)",
          }}
        >
          {/* Orange glow accent */}
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 230,
              height: 230,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(249, 115, 22, 0.35), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          {/* Results count pill (top-right) */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 18,
              zIndex: 1,
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              padding: "6px 14px",
              borderRadius: 999,
            }}
          >
            {lang === "mr"
              ? `${filteredEntries.length} निवडलेले`
              : `${filteredEntries.length} Results`}
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingRight: 110,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              📚
            </div>
            <div style={{ minWidth: 0, textAlign: "left" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {lang === "mr" ? "मेगा DPR लायब्ररी" : "Mega DPR Library"}
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {lang === "mr"
                  ? "1050+ सविस्तर परियोजना अहवाल · DIC/KVIC अनुरूप"
                  : "1050+ Detailed Project Reports · DIC/KVIC Compliant"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", marginTop: 18, maxWidth: 560 }}>
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 15,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Project... (e.g. masala, papad, dairy etc..)"
              style={{
                width: "100%",
                padding: "13px 44px 13px 46px",
                borderRadius: 999,
                border: "none",
                outline: "none",
                fontSize: 14,
                fontWeight: 500,
                color: "#111827",
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "none",
                  background: "#e5e7eb",
                  color: "#4b5563",
                  fontSize: 15,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: filter toggle + count */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="filter-toggle-btn"
            style={{
              display: "none",
              background: C.navy,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showFilters
              ? lang === "mr"
                ? "फिल्टर लपवा"
                : "Hide Filters"
              : lang === "mr"
              ? "फिल्टर दाखवा"
              : "Show Filters"}
          </button>
        </div>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {search.trim() !== "" && (
              <span
                onClick={() => setSearch("")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: `${C.orange}15`,
                  color: C.orange,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔍 {search.trim()}
                <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
              </span>
            )}
            {selectedSectors.map((s) => (
              <span
                key={s}
                onClick={() => toggleSector(s)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: `${SECTOR_COLORS[s]}15`,
                  color: SECTOR_COLORS[s],
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {s}
                <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
              </span>
            ))}
            {investmentRange !== "All" && (
              <span
                onClick={() => setInvestmentRange("All")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: `${C.orange}15`,
                  color: C.orange,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {investmentRange}
                <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
              </span>
            )}
            {selectedDistrict !== "All Districts" && (
              <span
                onClick={() => setSelectedDistrict("All Districts")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  borderRadius: 20,
                  background: `${C.navy}15`,
                  color: C.navy,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                📍 {distLabel(selectedDistrict)}
                <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              height: "40vh",
            }}
          >
            <Spinner size={48} />
            <div style={{ color: C.maroon, fontWeight: 600, fontSize: 15 }}>
              {lang === "mr" ? "लोड होत आहे..." : "Loading entries..."}
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: C.textopa,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ margin: 0, fontSize: 18, color: C.navy }}>
              {search.trim()
                ? lang === "mr"
                  ? `‘${search.trim()}’ साठी निकाल सापडला नाही`
                  : `No results for “${search.trim()}”`
                : lang === "mr"
                ? "निकाल सापडले नाही"
                : "No entries found"}
            </h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              {lang === "mr"
                ? "शोध किंवा फिल्टर बदलून पहा"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          /* Card Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {filteredEntries.map((entry) => (
              <DRPCard
                key={entry.variantId}
                entry={entry}
                getTagColor={getTagColor}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .drp-split { height: calc(100vh - 56px); scrollbar-width: thin; scrollbar-color: rgba(249, 115, 22, 0.55) rgba(20, 41, 82, 0.07); }
        .drp-split ::-webkit-scrollbar { width: 6px; height: 6px; }
        .drp-split ::-webkit-scrollbar-track { background: rgba(20, 41, 82, 0.07); border-radius: 999px; }
        .drp-split ::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.55); border-radius: 999px; }
        .drp-split ::-webkit-scrollbar-thumb:hover { background: #F97316; }
        @media (max-width: 1199px) {
          .drp-split { height: calc(100vh - 108px); }
        }
        @media (max-width: 900px) {
          .filter-toggle-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function DRPCard({ entry, getTagColor, lang }) {
  const sectorColor = SECTOR_COLORS[entry.sector] || "#6b7280";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      }}
    >
      {/* Top Color Bar */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${sectorColor}, ${sectorColor}88)`,
        }}
      />

      <div style={{ padding: "16px 18px" }}>
        {/* Sector & ODOP Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: sectorColor,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {entry.sector}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#6b7280",
              background: "#f1f5f9",
              padding: "3px 8px",
              borderRadius: 4,
            }}
          >
            ODOP: {entry.odop}
          </span>
        </div>

        {/* Variant Name */}
        <h3
          style={{
            margin: "0 0 4px",
            fontSize: 16,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1.3,
          }}
        >
          {entry.variantName}
          <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 13 }}>
            {" "}
            (Variant {entry.variantId})
          </span>
        </h3>

        {/* Location */}
        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          📍 {entry.location}
        </div>

        {/* Investment Range */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: C.navy,
            marginBottom: 12,
            padding: "8px 12px",
            background: `${C.navy}08`,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          {entry.investmentRange}
        </div>

        {/* ROI & Jobs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              background: "#ecfdf5",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#16a34a",
                lineHeight: 1,
              }}
            >
              {entry.roi}%
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              {lang === "mr" ? "ROIP" : "ROI"}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 0",
              background: "#eff6ff",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#2563eb",
                lineHeight: 1,
              }}
            >
              {entry.jobs}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              {lang === "mr" ? "नोकऱ्या" : "Jobs"}
            </div>
          </div>
        </div>

        {/* Subsidy */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "#fef3c7",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 14 }}>🏷️</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#92400e",
            }}
          >
            {entry.subsidyPercent}% {lang === "mr" ? "सवलत उपलब्ध" : "Subsidy Available"}
          </span>
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {entry.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: getTagColor(tag),
                background: `${getTagColor(tag)}12`,
                padding: "4px 8px",
                borderRadius: 4,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
