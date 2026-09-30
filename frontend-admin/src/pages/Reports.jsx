import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getReports, getVillageDetail } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";
import { override } from "../constants/placeRename";

const renameDist = (s) => override("district", "en", s) || s;
const renameTaluka = (s) => override("taluka", "en", s) || s;

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

  // Chart data
  const statusData = [
    { name: "Submitted", value: summary.totalSubmitted, color: "#F97316" },
    { name: "Approved", value: summary.totalApproved, color: C.green },
    { name: "Rejected", value: summary.totalRejected, color: "#dc2626" },
    { name: "Under Review", value: summary.totalUnderReview, color: "#7c3aed" },
    { name: "Draft", value: summary.totalDraft, color: "#6b7280" },
  ].filter((s) => s.value > 0);
  const totalForms = statusData.reduce((a, b) => a + b.value, 0);

  const districtChart = byDistrict.map((d) => ({
    ...d,
    label: renameDist(d.dist),
  }));
  const talukaChart = filteredTalukas.slice(0, 15).map((t) => ({
    ...t,
    label: `${renameTaluka(t.taluka)} (${renameDist(t.dist)})`,
  }));
  const villageChart = filteredVillages.slice(0, 15).map((v) => ({
    ...v,
    label: v.village,
  }));

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
              {villageDetail.village.village} — {renameTaluka(villageDetail.village.taluka)}, {renameDist(villageDetail.village.dist)}
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
        {/* Status Donut */}
        <Card title="Status Overview" icon="📊">
          {totalForms === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: C.textopa }}>
              No data
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 230,
                  height: 230,
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={2}
                      stroke="none"
                      animationDuration={600}
                    >
                      {statusData.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.navy }}>
                    {totalForms}
                  </div>
                  <div style={{ fontSize: 11, color: C.textopa }}>
                    Total Forms
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                  minWidth: 150,
                }}
              >
                {statusData.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: s.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 600, color: C.navy }}>
                      {s.name}
                    </span>
                    <span style={{ color: C.textopa }}>
                      {s.value} · {Math.round((s.value / totalForms) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* District-wise Chart */}
        <Card title="District-wise Registration" icon="📍">
          {districtChart.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.textopa }}>
              No data
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(300, districtChart.length * 26 + 30)}
            >
              <BarChart
                data={districtChart}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, (dMax) => Math.ceil(dMax * 1.18) || 1]}
                  tick={{ fontSize: 11, fill: C.textopa }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={115}
                  interval={0}
                  tick={{ fontSize: 12, fill: C.navy }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(20,41,82,0.05)" }} />
                <Bar
                  dataKey="count"
                  fill={C.navy}
                  radius={[0, 6, 6, 0]}
                  animationDuration={600}
                  style={{ cursor: "pointer" }}
                  onClick={(item) => {
                    if (item?.payload?.dist) setSelectedDist(item.payload.dist);
                  }}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fontWeight: 700, fill: C.navy }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 20,
        }}
      >
        {/* Taluka-wise Chart */}
        <Card
          title={`${
            selectedDist ? `Taluka-wise — ${renameDist(selectedDist)}` : "Taluka-wise Registration"
          }${filteredTalukas.length > 15 ? " (Top 15)" : ""}`}
          icon="🏘️"
          onBack={selectedDist ? handleBack : null}
        >
          {talukaChart.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.textopa }}>
              No data
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(300, talukaChart.length * 30 + 30)}
            >
              <BarChart
                data={talukaChart}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, (dMax) => Math.ceil(dMax * 1.18) || 1]}
                  tick={{ fontSize: 11, fill: C.textopa }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={150}
                  interval={0}
                  tick={{ fontSize: 11, fill: C.navy }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(249,115,22,0.06)" }} />
                <Bar
                  dataKey="count"
                  fill="#F97316"
                  radius={[0, 6, 6, 0]}
                  animationDuration={600}
                  style={{ cursor: "pointer" }}
                  onClick={(item) => {
                    const t = item?.payload;
                    if (t) {
                      setSelectedDist(t.dist);
                      setSelectedTaluka(t.taluka);
                    }
                  }}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fontWeight: 700, fill: "#c2410c" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Village-wise Chart */}
        <Card
          title={`${
            selectedTaluka
              ? `Village-wise — ${renameTaluka(selectedTaluka)}, ${renameDist(selectedDist)}`
              : selectedDist
              ? `Village-wise — ${renameDist(selectedDist)}`
              : "Village-wise Registration"
          }${filteredVillages.length > 15 ? " (Top 15)" : ""}`}
          icon="🏠"
          onBack={selectedTaluka || selectedDist ? handleBack : null}
        >
          {villageChart.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.textopa }}>
              No data
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(300, villageChart.length * 30 + 30)}
            >
              <BarChart
                data={villageChart}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, (dMax) => Math.ceil(dMax * 1.18) || 1]}
                  tick={{ fontSize: 11, fill: C.textopa }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  interval={0}
                  tick={{ fontSize: 11, fill: C.navy }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(22,163,74,0.06)" }} />
                <Bar
                  dataKey="count"
                  fill={C.green}
                  radius={[0, 6, 6, 0]}
                  animationDuration={600}
                  style={{ cursor: "pointer" }}
                  onClick={(item) => {
                    const v = item?.payload;
                    if (v) handleVillageClick(v.dist, v.taluka, v.village);
                  }}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fontWeight: 700, fill: "#15803d" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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

const tooltipBox = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "8px 12px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  fontSize: 13,
};

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div style={tooltipBox}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4 }}>
        {row.label}
      </div>
      <div style={{ color: C.navy, fontWeight: 600 }}>Total: {row.count}</div>
      <div style={{ color: "#F97316" }}>Submitted: {row.submitted}</div>
      <div style={{ color: C.green }}>Approved: {row.approved}</div>
      <div style={{ color: "#dc2626" }}>Rejected: {row.rejected}</div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <div style={tooltipBox}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            background: p.color,
          }}
        />
        <span style={{ fontWeight: 700, color: C.navy }}>{p.name}</span>
        <span style={{ color: C.textopa }}>{p.value}</span>
      </div>
    </div>
  );
}
