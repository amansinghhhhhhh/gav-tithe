import { useState, useEffect, useMemo } from "react";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";
import {
  getDRPLibraries,
  createDRPLibrary,
  updateDRPLibrary,
  deleteDRPLibrary,
} from "../services/api";

const SECTORS = [
  "Agro-Processing", "Food Processing", "Dairy", "Manufacturing",
  "Handicraft", "Textile", "Animal Husbandry", "Herbal/Ayurvedic",
  "Agriculture", "Apiculture", "Renewable Energy", "Infrastructure", "Service",
];

const INVESTMENT_PRESETS = [
  "₹0.5L - ₹2L", "₹1L - ₹5L", "₹2L - ₹10L",
  "₹5L - ₹25L", "₹10L - ₹50L", "₹25L - ₹1Cr",
];

const emptyForm = {
  sector: "Manufacturing",
  odop: "General",
  variantName: "",
  variantId: "",
  location: "",
  investmentRange: "₹1L - ₹5L",
  investmentMin: 1,
  investmentMax: 5,
  roi: "",
  jobs: "",
  subsidyPercent: "",
  tags: "",
  category: "",
};

export default function DRPLibraries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDRPLibraries();
      if (res.success) setEntries(res.entries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterSector !== "All") {
      list = list.filter((e) => e.sector === filterSector);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.variantName.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          String(e.variantId).includes(q)
      );
    }
    return list;
  }, [entries, search, filterSector]);

  const showSuccess = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      sector: entry.sector,
      odop: entry.odop || "General",
      variantName: entry.variantName,
      variantId: entry.variantId,
      location: entry.location,
      investmentRange: entry.investmentRange,
      investmentMin: entry.investmentMin,
      investmentMax: entry.investmentMax,
      roi: entry.roi,
      jobs: entry.jobs,
      subsidyPercent: entry.subsidyPercent,
      tags: (entry.tags || []).join(", "),
      category: entry.category || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete "${entry.variantName}" (Variant ${entry.variantId})?`)) return;
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      const res = await deleteDRPLibrary(entry._id);
      if (res.success) {
        setEntries((prev) => prev.filter((e) => e._id !== entry._id));
        showSuccess("Entry deleted!");
      } else {
        alert(res.message || "Delete failed");
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSave = async () => {
    if (!form.variantName || !form.variantId || !form.location) {
      alert("Variant Name, Variant ID, and Location are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        variantId: Number(form.variantId),
        roi: Number(form.roi) || 0,
        jobs: Number(form.jobs) || 0,
        subsidyPercent: Number(form.subsidyPercent) || 0,
        investmentMin: Number(form.investmentMin) || 0,
        investmentMax: Number(form.investmentMax) || 0,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };
      let res;
      if (editingId) {
        res = await updateDRPLibrary(editingId, payload);
      } else {
        res = await createDRPLibrary(payload);
      }
      if (res.success) {
        setShowForm(false);
        showSuccess(editingId ? "Entry updated!" : "Entry created!");
        load();
      } else {
        alert(res.message || "Save failed");
      }
    } catch (err) {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "investmentRange") {
        const presets = {
          "₹0.5L - ₹2L": { min: 0.5, max: 2 },
          "₹1L - ₹5L": { min: 1, max: 5 },
          "₹2L - ₹10L": { min: 2, max: 10 },
          "₹5L - ₹25L": { min: 5, max: 25 },
          "₹10L - ₹50L": { min: 10, max: 50 },
          "₹25L - ₹1Cr": { min: 25, max: 100 },
        };
        if (presets[value]) {
          next.investmentMin = presets[value].min;
          next.investmentMax = presets[value].max;
        }
      }
      return next;
    });
  };

  return (
    <div style={{ padding: "28px 24px" }}>
      {/* Toast */}
      {msg && (
        <div
          style={{
            position: "fixed", top: 20, right: 24, zIndex: 9999,
            background: msg.includes("deleted") ? "#fee2e2" : "#dcfce7",
            border: `1px solid ${msg.includes("deleted") ? "#fca5a5" : "#86efac"}`,
            color: msg.includes("deleted") ? "#991b1b" : "#166534",
            padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ color: C.navy, fontWeight: 800, margin: 0 }}>
          DRP Libraries ({filtered.length})
        </h2>
        <button
          onClick={openAdd}
          style={{
            padding: "10px 24px", background: C.green, color: "#fff",
            border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14,
            cursor: "pointer",
          }}
        >
          + Add New
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name, location, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 250px", padding: "10px 14px", border: "1.5px solid #ddd",
            borderRadius: 8, fontSize: 14, outline: "none",
          }}
        />
        <select
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          style={{
            padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8,
            fontSize: 14, outline: "none", background: "#fff",
          }}
        >
          <option value="All">All Sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Spinner size={48} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: C.textopa }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p>No entries found</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: C.light }}>
                  {["ID", "Sector", "Variant Name", "ODOP", "Location", "Investment", "ROI", "Jobs", "Subsidy", "Tags", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textopa, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: C.navy }}>
                      {entry.variantId}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>
                      <span style={{
                        display: "inline-block", padding: "3px 8px", borderRadius: 4,
                        background: `${C.navy}10`, color: C.navy, fontWeight: 600, fontSize: 12,
                      }}>
                        {entry.sector}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>
                      {entry.variantName}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7280" }}>
                      {entry.odop}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>
                      📍 {entry.location}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>
                      {entry.investmentRange}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>
                      <span style={{ color: "#16a34a", fontWeight: 700 }}>{entry.roi}%</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>
                      <span style={{ color: "#2563eb", fontWeight: 700 }}>{entry.jobs}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>
                      <span style={{ color: "#92400e", fontWeight: 600 }}>{entry.subsidyPercent}%</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 11 }}>
                      {(entry.tags || []).slice(0, 2).map((t) => (
                        <span key={t} style={{ display: "inline-block", padding: "2px 6px", borderRadius: 3, background: "#f1f5f9", color: "#475569", marginRight: 4, marginBottom: 2 }}>
                          {t}
                        </span>
                      ))}
                      {(entry.tags || []).length > 2 && (
                        <span style={{ color: "#9ca3af" }}>+{entry.tags.length - 2}</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 8px", borderRadius: 4,
                        background: entry.isActive ? "#dcfce7" : "#fee2e2",
                        color: entry.isActive ? "#166534" : "#991b1b",
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {entry.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(entry)}
                          style={{
                            padding: "6px 12px", background: C.navy, color: "#fff",
                            border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry)}
                          style={{
                            padding: "6px 12px", background: "#dc2626", color: "#fff",
                            border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 10000, padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 600,
            maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.navy }}>
                {editingId ? "Edit DRP Entry" : "Add New DRP Entry"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "none", border: "none", fontSize: 24,
                  cursor: "pointer", color: "#9ca3af",
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Sector */}
                <div>
                  <label style={labelStyle}>Sector *</label>
                  <select value={form.sector} onChange={(e) => updateField("sector", e.target.value)} style={inputStyle}>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* ODOP */}
                <div>
                  <label style={labelStyle}>ODOP</label>
                  <input value={form.odop} onChange={(e) => updateField("odop", e.target.value)} style={inputStyle} placeholder="General" />
                </div>

                {/* Variant Name */}
                <div>
                  <label style={labelStyle}>Variant Name *</label>
                  <input value={form.variantName} onChange={(e) => updateField("variantName", e.target.value)} style={inputStyle} placeholder="e.g. Soap Manufacturing" />
                </div>

                {/* Variant ID */}
                <div>
                  <label style={labelStyle}>Variant ID *</label>
                  <input type="number" value={form.variantId} onChange={(e) => updateField("variantId", e.target.value)} style={inputStyle} placeholder="e.g. 1045" />
                </div>

                {/* Location */}
                <div>
                  <label style={labelStyle}>Location *</label>
                  <input value={form.location} onChange={(e) => updateField("location", e.target.value)} style={inputStyle} placeholder="e.g. Mumbai" />
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>Category</label>
                  <input value={form.category} onChange={(e) => updateField("category", e.target.value)} style={inputStyle} placeholder="e.g. Food, Herbal" />
                </div>

                {/* Investment Range */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Investment Range</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    {INVESTMENT_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => updateField("investmentRange", p)}
                        style={{
                          padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                          border: `1.5px solid ${form.investmentRange === p ? C.navy : "#e5e7eb"}`,
                          background: form.investmentRange === p ? `${C.navy}10` : "#fff",
                          color: form.investmentRange === p ? C.navy : "#6b7280",
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <input type="number" step="0.1" value={form.investmentMin} onChange={(e) => updateField("investmentMin", e.target.value)} style={inputStyle} placeholder="Min (Lakhs)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="number" step="0.1" value={form.investmentMax} onChange={(e) => updateField("investmentMax", e.target.value)} style={inputStyle} placeholder="Max (Lakhs)" />
                    </div>
                  </div>
                </div>

                {/* ROI */}
                <div>
                  <label style={labelStyle}>ROI (%)</label>
                  <input type="number" value={form.roi} onChange={(e) => updateField("roi", e.target.value)} style={inputStyle} placeholder="e.g. 45" />
                </div>

                {/* Jobs */}
                <div>
                  <label style={labelStyle}>Jobs</label>
                  <input type="number" value={form.jobs} onChange={(e) => updateField("jobs", e.target.value)} style={inputStyle} placeholder="e.g. 10" />
                </div>

                {/* Subsidy */}
                <div>
                  <label style={labelStyle}>Subsidy (%)</label>
                  <input type="number" value={form.subsidyPercent} onChange={(e) => updateField("subsidyPercent", e.target.value)} style={inputStyle} placeholder="e.g. 35" />
                </div>

                {/* Tags */}
                <div>
                  <label style={labelStyle}>Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => updateField("tags", e.target.value)} style={inputStyle} placeholder="e.g. PMEGP, DIC, MSME" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px", borderTop: "1px solid #f0f0f0",
              display: "flex", justifyContent: "flex-end", gap: 12,
            }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 24px", background: "#f3f4f6", color: "#374151",
                  border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 24px", background: saving ? "#9ca3af" : C.green,
                  color: "#fff", border: "none", borderRadius: 8, fontWeight: 700,
                  fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#374151",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3,
};

const inputStyle = {
  width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb",
  borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
};
