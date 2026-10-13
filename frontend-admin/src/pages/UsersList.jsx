import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getExcelUrl, deleteUser } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";

const STATUS_CHIPS = [
  { key: "all", label: "Total", color: C.navy },
  { key: "draft", label: "Draft", color: "#6b7280" },
  { key: "submitted", label: "Submitted", color: "#F97316" },
  { key: "under_review", label: "Under Review", color: "#7c3aed" },
  { key: "approved", label: "Approved", color: "#16a34a" },
  { key: "rejected", label: "Rejected", color: "#dc2626" },
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #142952, #1e3a6e)",
  "linear-gradient(135deg, #F97316, #ea580c)",
  "linear-gradient(135deg, #1A7A3C, #16a34a)",
  "linear-gradient(135deg, #7c3aed, #6d28d9)",
  "linear-gradient(135deg, #0ea5e9, #0284c7)",
];

const initials = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarGrad = (name) => {
  let h = 0;
  for (const ch of String(name || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
};

export default function UsersList() {
  const PAGE_SIZE = 50;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers().then((res) => {
      if (res.success) setUsers(res.users);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (u) => {
    const name = u.fullName || u.name || "this user";
    if (!window.confirm(`Delete "${name}"? All related data (form, documents, edit requests) will also be deleted.`)) return;
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    setDeletingId(u._id);
    const res = await deleteUser(u._id);
    setDeletingId(null);
    if (res.success) {
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
    } else {
      alert(res.message || "Delete failed");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.fullName || u.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (u.mobile || "").includes(search) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.uniqueId || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.formStatus === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const counts = STATUS_CHIPS.reduce((acc, c) => {
    acc[c.key] = c.key === "all" ? users.length : users.filter((u) => u.formStatus === c.key).length;
    return acc;
  }, {});

  return (
    <div style={{ padding: "28px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ color: C.navy, fontWeight: 800, margin: 0 }}>Users List</h2>
        <a
          href={getExcelUrl()}
          download="applications.xlsx"
          style={{
            padding: "9px 18px",
            background: C.green,
            color: "#fff",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ⬇ Download Excel
        </a>
      </div>

      {/* ── Status summary chips (click = filter) ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {STATUS_CHIPS.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              onClick={() => {
                setFilter(c.key);
                setPage(1);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: active ? "#eef2ff" : C.white,
                border: active ? `1.5px solid ${C.navy}` : "1.5px solid #e2e8f0",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: C.navy,
                boxShadow: active ? "0 2px 8px rgba(20,41,82,0.12)" : "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              <span style={{ color: C.textopa }}>{c.label}</span>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{counts[c.key]}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.textopa,
              fontSize: 13,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            className="admin-search"
            placeholder="Search name, mobile, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "9px 14px 9px 34px",
              border: "1.5px solid #cbd5e1",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              minWidth: 240,
              background: C.white,
            }}
          />
        </div>
        <select
          className="admin-search"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "9px 14px",
            border: "1.5px solid #cbd5e1",
            borderRadius: 10,
            fontSize: 14,
            outline: "none",
            background: C.white,
            cursor: "pointer",
          }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: C.white,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Spinner size={48} />
            <div style={{ color: C.textopa, fontWeight: 600 }}>Loading...</div>
          </div>
        ) : (
          <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.navy }}>
                {[
                  "#",
                  "ID",
                  "Name",
                  "Mobile",
                  "Status",
                  "Registered",
                  "Form Filled",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 10px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: C.textopa,
                      fontSize: 14,
                    }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                pageItems.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 13,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {startIndex + i + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={u.uniqueId || ""}
                    >
                      {u.uniqueId ? (
                        <span
                          style={{
                            background: "#EEF2F7",
                            color: C.navy,
                            padding: "3px 9px",
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            fontFamily: "monospace",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {u.uniqueId}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        maxWidth: 240,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: avatarGrad(u.fullName || u.name),
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12.5,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials(u.fullName || u.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "#0f172a",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {u.fullName || u.name || "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: C.textopa,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {u.email || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 14,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.mobile || "—"}
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <StatusBadge status={u.formStatus} />
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 13,
                        color: C.textopa,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        fontSize: 13,
                        color: C.textopa,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.formSubmittedAt
                        ? new Date(u.formSubmittedAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-navy"
                          onClick={() => navigate(`/users/${u._id}`)}
                          style={{
                            padding: "6px 13px",
                            background: C.navy,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 12,
                            cursor: "pointer",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          👁 View
                        </button>
                        <button
                          className="btn-ghost-red"
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u._id}
                          style={{
                            padding: "6px 13px",
                            background: deletingId === u._id ? "#fee2e2" : "#fff",
                            color: "#dc2626",
                            border: "1px solid #fca5a5",
                            borderRadius: 8,
                            fontSize: 12,
                            cursor: deletingId === u._id ? "default" : "pointer",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {deletingId === u._id ? "Deleting..." : "🗑 Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              padding: "12px 16px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <div style={{ fontSize: 13, color: C.textopa }}>
              Showing {startIndex + 1}–{startIndex + pageItems.length} of{" "}
              {filtered.length}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                style={{
                  padding: "6px 14px",
                  background: C.light,
                  color: C.navy,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: safePage <= 1 ? "default" : "pointer",
                  opacity: safePage <= 1 ? 0.45 : 1,
                }}
              >
                ‹ Prev
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                style={{
                  padding: "6px 14px",
                  background: C.light,
                  color: C.navy,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: safePage >= totalPages ? "default" : "pointer",
                  opacity: safePage >= totalPages ? 0.45 : 1,
                }}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: { bg: "#f3f4f6", color: "#6b7280", label: "Draft" },
    submitted: { bg: "#fff7ed", color: "#F97316", label: "Submitted" },
    under_review: { bg: "#ede9fe", color: "#7c3aed", label: "Under Review" },
    approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
    rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
    not_started: { bg: "#f3f4f6", color: "#6b7280", label: "Not Started" },
  };
  const s = map[status] || map.not_started;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  );
}
