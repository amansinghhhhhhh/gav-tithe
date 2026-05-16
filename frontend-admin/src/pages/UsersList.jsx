import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../services/api";
import C from "../constants/colors";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers().then((res) => {
      if (res.success) setUsers(res.users);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.fullName || u.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (u.mobile || "").includes(search) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || u.formStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: "28px 24px" }}>
      <h2 style={{ color: C.navy, fontWeight: 800, marginBottom: 24 }}>
        Users List
      </h2>

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
          <div style={{ padding: 40, textAlign: "center", color: C.textopa }}>
            Loading...
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.light }}>
                {[
                  "#",
                  "Name",
                  "Mobile",
                  "Email",
                  "Status",
                  "Registered",
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
                    colSpan={7}
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: C.textopa,
                    }}
                  >
                    Koi user nahi mila
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
                    <td style={{ padding: "12px 14px" }}>
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
