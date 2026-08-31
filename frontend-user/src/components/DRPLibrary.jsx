import { useState, useEffect, useMemo } from "react";
import C from "../constants/colors";
import { useLang } from "../context/LangContext";
import { Spinner } from "./shared/Spinner";
import { getDRPEntries } from "../services/api";
import { districts } from "../constants/maharashtraData";

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
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [investmentRange, setInvestmentRange] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [showFilters, setShowFilters] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDRPEntries({
        sector: selectedSectors.length === 1 ? selectedSectors[0] : undefined,
        investmentRange,
        district: selectedDistrict,
      });
      if (res.success) setEntries(res.entries);
    } catch (err) {
      console.error("DRP load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSectors, investmentRange, selectedDistrict]);

  const filteredEntries = useMemo(() => {
    if (selectedSectors.length <= 1) return entries;
    return entries.filter((e) => selectedSectors.includes(e.sector));
  }, [entries, selectedSectors]);

  const toggleSector = (sector) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  const clearFilters = () => {
    setSelectedSectors([]);
    setInvestmentRange("All");
    setSelectedDistrict("All Districts");
  };

  const hasActiveFilters =
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
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      {/* ── Filter Sidebar ── */}
      <div
        style={{
          width: showFilters ? 270 : 0,
          minWidth: showFilters ? 270 : 0,
          flexShrink: 0,
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            padding: "20px",
            position: "sticky",
            top: 20,
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
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {lang === "mr" ? "क्षेत्र" : "Sector"}
            </h4>
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
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {lang === "mr" ? "गुंतवणूक श्रेणी" : "Investment Range"}
            </h4>
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
          <div>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {lang === "mr" ? "जिल्हा / ODOP" : "District / ODOP"}
            </h4>
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
              <option value="All Districts">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setShowFilters((p) => !p)}
              style={{
                display: "none",
                background: C.navy,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
              className="filter-toggle-btn"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: C.navy,
              }}
            >
              {lang === "mr" ? "DPR लायब्ररी" : "DRP Library"}
            </h2>
          </div>
          <div
            style={{
              fontSize: 14,
              color: C.textopa,
              fontWeight: 600,
              background: "#f1f5f9",
              padding: "6px 14px",
              borderRadius: 20,
            }}
          >
            {lang === "mr"
              ? `${filteredEntries.length} निवडलेले`
              : `${filteredEntries.length} Results`}
          </div>
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
                📍 {selectedDistrict}
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
              {lang === "mr" ? "निकाल सापडले नाही" : "No entries found"}
            </h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              {lang === "mr"
                ? "फिल्टर बदलून पहा"
                : "Try adjusting your filters"}
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
