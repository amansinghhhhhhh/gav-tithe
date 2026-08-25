import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getExcelUrl, deleteUser } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
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

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        <input
          placeholder="Search name, mobile, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "9px 14px",
            border: "1.5px solid #ddd",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            minWidth: 240,
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "9px 14px",
            border: "1.5px solid #ddd",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            background: C.white,
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
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Spinner size={48} />
            <div style={{ color: C.textopa, fontWeight: 600 }}>Loading...</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.light }}>
                {[
                  "#",
                  "ID",
                  "Name",
                  "Mobile",
                  "Email",
                  "Status",
                  "Registered",
                  "Form Filled",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: 13,
                      color: C.textopa,
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
                    colSpan={9}
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: C.textopa,
                    }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 13,
                        color: C.textopa,
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.navy,
                        fontFamily: "monospace",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {u.uniqueId || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {u.fullName || u.name || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 14 }}>
                      {u.mobile || "—"}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 13,
                        color: C.textopa,
                      }}
                    >
                      {u.email || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={u.formStatus} />
                    </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13,
                      color: C.textopa,
                    }}
                  >
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13,
                      color: C.textopa,
                    }}
                  >
                    {u.formSubmittedAt
                      ? new Date(u.formSubmittedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => navigate(`/users/${u._id}`)}
                          style={{
                            padding: "6px 14px",
                            background: C.navy,
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deletingId === u._id}
                          style={{
                            padding: "6px 14px",
                            background: deletingId === u._id ? "#fca5a5" : "#fee2e2",
                            color: "#dc2626",
                            border: "1px solid #fca5a5",
                            borderRadius: 6,
                            fontSize: 12,
                            cursor: deletingId === u._id ? "default" : "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {deletingId === u._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}
