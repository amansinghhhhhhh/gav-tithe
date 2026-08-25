import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports, getVillageDetail } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDist, setSelectedDist] = useState(null);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [villageDetail, setVillageDetail] = useState(null);
  const [villageLoading, setVillageLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getReports().then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }, []);

  const handleVillageClick = async (dist, taluka, village) => {
    setVillageLoading(true);
    setSelectedDist(dist);
    setSelectedTaluka(taluka);
    const res = await getVillageDetail(dist, taluka, village);
    if (res.success) setVillageDetail(res);
    setVillageLoading(false);
  };

  const handleBack = () => {
    setSelectedDist(null);
    setSelectedTaluka(null);
    setVillageDetail(null);
  };

  if (loading)
    return (
      <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Spinner size={48} />
        <div style={{ color: C.maroon, fontWeight: 600 }}>Loading reports...</div>
      </div>
    );

  if (!data)
    return <div style={{ padding: 40, color: C.textopa }}>Failed to load reports</div>;

  const { summary, byDistrict, byTaluka, byVillage } = data;

  // Filter talukas by selected district
  const filteredTalukas = selectedDist
    ? byTaluka.filter((t) => t.dist === selectedDist)
    : byTaluka;

  // Filter villages by selected district and taluka
  const filteredVillages = selectedDist && selectedTaluka
    ? byVillage.filter(
        (v) => v.dist === selectedDist && v.taluka === selectedTaluka
      )
    : selectedDist
    ? byVillage.filter((v) => v.dist === selectedDist)
    : byVillage;

  return (
    <div style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ color: C.navy, fontWeight: 800, marginBottom: 24 }}>
        Reports & Analytics
      </h2>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        {[
          { label: "Total Users", value: summary.totalUsers, color: C.navy },
          { label: "Submitted", value: summary.totalSubmitted, color: "#F97316" },
          { label: "Under Review", value: summary.totalUnderReview, color: "#7c3aed" },
          { label: "Approved", value: summary.totalApproved, color: C.green },
          { label: "Rejected", value: summary.totalRejected, color: "#dc2626" },
          { label: "Draft", value: summary.totalDraft, color: "#6b7280" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: C.white,
              borderRadius: 12,
              padding: "16px 20px",
              flex: "1 1 140px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              borderTop: `4px solid ${card.color}`,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: C.textopa, marginTop: 4 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Village Detail Modal */}
      {villageDetail && (
        <div
          style={{
            background: C.white,
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              onClick={handleBack}
              style={{
                background: C.light,
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              ← Back
            </button>
            <h3 style={{ color: C.navy, fontWeight: 700, margin: 0 }}>
              {villageDetail.village.village} — {villageDetail.village.taluka}, {villageDetail.village.dist}
            </h3>
            <span style={{ color: C.textopa, fontSize: 13, marginLeft: "auto" }}>
              {villageDetail.total} registrations
            </span>
          </div>

          {villageDetail.users.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: C.textopa }}>
              No users found
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.light }}>
                  {["#", "ID", "Name", "Mobile", "Status", "Submitted"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 12,
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
                {villageDetail.users.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: C.textopa }}>
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        color: C.navy,
                      }}
                    >
                      {u.uniqueId || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 14, fontWeight: 600 }}>
                      {u.fullName || u.name || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 14 }}>
                      {u.mobile || "—"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <StatusBadge status={u.status} />
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: C.textopa }}>
                      {u.submittedAt
                        ? new Date(u.submittedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* District-wise Table */}
        <Card title="District-wise Registration" icon="📍">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                {["District", "Total", "Submitted", "Approved", "Rejected"].map((h) => (
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
              {byDistrict.map((d) => (
                <tr
                  key={d.dist}
                  style={{ borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
                  onClick={() => setSelectedDist(d.dist)}
                >
                  <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: C.navy }}>
                    {d.dist}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                    {d.count}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#F97316" }}>
                    {d.submitted}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: C.green }}>
                    {d.approved}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "#dc2626" }}>
                    {d.rejected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Taluka-wise Table */}
        <Card
          title={selectedDist ? `Taluka-wise — ${selectedDist}` : "Taluka-wise Registration"}
          icon="🏘️"
          onBack={selectedDist ? handleBack : null}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                {["District", "Taluka", "Total", "Submitted", "Approved"].map((h) => (
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
              {filteredTalukas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: "center", color: C.textopa }}>
                    No data
                  </td>
                </tr>
              ) : (
                filteredTalukas.map((t) => (
                  <tr
                    key={`${t.dist}-${t.taluka}`}
                    style={{ borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedDist(t.dist);
                      setSelectedTaluka(t.taluka);
                    }}
                  >
                    <td style={{ padding: "10px 12px", fontSize: 12, color: C.textopa }}>
                      {t.dist}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: C.navy }}>
                      {t.taluka}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                      {t.count}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#F97316" }}>
                      {t.submitted}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: C.green }}>
                      {t.approved}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Village-wise Table */}
      <div style={{ marginTop: 20 }}>
        <Card
          title={
            selectedTaluka
              ? `Village-wise — ${selectedTaluka}, ${selectedDist}`
              : selectedDist
              ? `Village-wise — ${selectedDist}`
              : "Village-wise Registration"
          }
          icon="🏠"
          onBack={selectedTaluka || selectedDist ? handleBack : null}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                {["District", "Taluka", "Village", "Total", "Submitted", "Approved", "Rejected"].map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredVillages.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: "center", color: C.textopa }}>
                    No data
                  </td>
                </tr>
              ) : (
                filteredVillages.map((v) => (
                  <tr
                    key={`${v.dist}-${v.taluka}-${v.village}`}
                    style={{ borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
                    onClick={() => handleVillageClick(v.dist, v.taluka, v.village)}
                  >
                    <td style={{ padding: "10px 12px", fontSize: 12, color: C.textopa }}>
                      {v.dist}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: C.textopa }}>
                      {v.taluka}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600, color: C.navy }}>
                      {v.village}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                      {v.count}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#F97316" }}>
                      {v.submitted}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: C.green }}>
                      {v.approved}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#dc2626" }}>
                      {v.rejected}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, icon, children, onBack }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: C.light,
              border: "none",
              borderRadius: 6,
              padding: "4px 10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            ←
          </button>
        )}
        <h3 style={{ color: C.navy, fontWeight: 700, margin: 0, fontSize: 14 }}>
          {icon} {title}
        </h3>
      </div>
      <div style={{ overflowX: "auto" }}>{children}</div>
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
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}
