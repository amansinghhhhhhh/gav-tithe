import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, migrateAssessments } from "../services/api";

// images/icons
import totalUser from "../assets/totalUser.svg";
import submitted from "../assets/submitted.svg";
import underReview from "../assets/underReview.svg";
import rejected from "../assets/rejected.svg";

// colors
import C from "../constants/colors";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers().then((res) => {
      if (res.success) setUsers(res.users);
      setLoading(false);
    });
  }, []);

  const stats = {
    total: users.length,
    submitted: users.filter((u) => u.formStatus === "submitted").length,
    approved: users.filter((u) => u.formStatus === "approved").length,
    rejected: users.filter((u) => u.formStatus === "rejected").length,
    under_review: users.filter((u) => u.formStatus === "under_review").length,
  };

  const cards = [
    {
      label: "Total Users",
      value: stats.total,
      color: C.navy,
      icon: <img src={totalUser} />,
    },
    {
      label: "Submitted",
      value: stats.submitted,
      color: "#F97316",
      icon: <img src={submitted} />,
    },
    {
      label: "Under Review",
      value: stats.under_review,
      color: "#7c3aed",
      icon: <img src={underReview} />,
    },
    {
      label: "Approved",
      value: stats.approved,
      color: C.green,
      icon: <img src={totalUser} />,
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: C.red,
      icon: <img src={rejected} />,
    },
  ];

  return (
    <div style={{ padding: "28px 24px" }}>
      <h2 style={{ color: C.navy, fontWeight: 800, marginBottom: 24 }}>
        Dashboard
      </h2>

      {loading ? (
        <div style={{ textAlign: "center", color: C.textopa, marginTop: 60 }}>
          Loading...
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 32,
            }}
          >
            {cards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: C.white,
                  borderRadius: 12,
                  padding: "20px 24px",
                  flex: "1 1 140px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  borderTop: `4px solid ${card.color}`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                <div
                  style={{ fontSize: 28, fontWeight: 800, color: card.color }}
                >
                  {card.value}
                </div>
                <div style={{ fontSize: 13, color: C.textopa }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Temporary: Migration Button */}
          <div style={{ marginBottom: 24 }}>
            <button
              disabled={migrating}
              onClick={async () => {
                if (!window.confirm("Migrate all existing users' assessments? This will mark them as completed.")) return;
                setMigrating(true);
                setMigrateMsg("");
                try {
                  const res = await migrateAssessments();
                  setMigrateMsg(res.message || "Done!");
                } catch (err) {
                  setMigrateMsg("Error: " + err.message);
                } finally {
                  setMigrating(false);
                }
              }}
              style={{
                padding: "10px 24px",
                background: migrating ? "#9ca3af" : "#F97316",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: migrating ? "not-allowed" : "pointer",
              }}
            >
              {migrating ? "Migrating..." : "🔄 Migrate Assessments"}
            </button>
            {migrateMsg && (
              <span style={{ marginLeft: 12, fontSize: 13, color: C.green, fontWeight: 600 }}>
                {migrateMsg}
              </span>
            )}
          </div>

          {/* Recent Users */}
          <div
            style={{
              background: C.white,
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            <h3 style={{ color: C.navy, marginBottom: 16, fontWeight: 700 }}>
              Recent Registrations
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.light }}>
                  {["Name", "Mobile", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
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
                {users.slice(0, 5).map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 14px", fontSize: 14 }}>
                      {u.fullName || u.name || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 14 }}>
                      {u.mobile || "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={u.formStatus} />
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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
