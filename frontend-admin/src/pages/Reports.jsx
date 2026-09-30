import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getReports, getVillageDetail } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";
import { override } from "../constants/placeRename";
import logoPng from "../assets/gulogotransparent.png";

const renameDist = (s) => override("district", "en", s) || s;
const renameTaluka = (s) => override("taluka", "en", s) || s;

const hexToRgba = (hex, a) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const tickStyle = { fontSize: 11, fill: "#94a3b8" };

const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};

const statusLabel = (s) => STATUS_LABELS[s] || "Not Started";

const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "report";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Rotated bitmap banata hai (FormPreview watermark style, -30° about center)
const rotateImage = (img, deg) => {
  const rad = (deg * Math.PI) / 180;
  const w = img.width;
  const h = img.height;
  const bw = Math.ceil(Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad)));
  const bh = Math.ceil(Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad)));
  const c = document.createElement("canvas");
  c.width = bw;
  c.height = bh;
  const ctx = c.getContext("2d");
  ctx.translate(bw / 2, bh / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  return c;
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDist, setSelectedDist] = useState(null);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [villageDetail, setVillageDetail] = useState(null);
  const [villageLoading, setVillageLoading] = useState(false);
  const [showAllDistrict, setShowAllDistrict] = useState(false);
  const [showAllTaluka, setShowAllTaluka] = useState(false);
  const [showAllVillage, setShowAllVillage] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    getReports().then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setShowAllTaluka(false);
    setShowAllVillage(false);
  }, [selectedDist, selectedTaluka]);

  useEffect(() => {
    if (!villageDetail && !villageLoading) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [villageDetail, villageLoading]);

  const handleVillageClick = async (dist, taluka, village) => {
    setVillageLoading(true);
    setVillageDetail(null);
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
    setVillageLoading(false);
  };

  const downloadReportPdf = async () => {
    if (!villageDetail || villageDetail.users.length === 0 || pdfBusy) return;
    setPdfBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");
      const logo = await loadImage(logoPng);

      const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      });
      const M = 14;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(20, 41, 82);
      doc.text("Gaon Tithe Udyojak", M, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${villageDetail.village.village} — ${renameTaluka(villageDetail.village.taluka)}, ${renameDist(villageDetail.village.dist)}`,
        M,
        27
      );
      doc.setFontSize(10);
      doc.text(
        `${villageDetail.total} registrations  ·  Generated ${new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,
        M,
        33
      );

      autoTable(doc, {
        startY: 39,
        head: [["#", "ID", "Name", "Mobile", "Status", "Submitted"]],
        body: villageDetail.users.map((u, i) => [
          i + 1,
          u.uniqueId || "—",
          u.fullName || u.name || "—",
          u.mobile || "—",
          statusLabel(u.status),
          u.submittedAt
            ? new Date(u.submittedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
        ]),
        margin: { top: 34, bottom: 22, left: M, right: M },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [230, 235, 242],
          lineWidth: 0.2,
          textColor: [51, 65, 85],
        },
        headStyles: {
          fillColor: [20, 41, 82],
          textColor: [255, 255, 255],
          halign: "left",
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 34 }, 4: { cellWidth: 26 } },
      });

      // Har page par watermark + footer
      const rotated = rotateImage(logo, -30);
      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        const wmW = 110;
        const wmH = wmW * (rotated.height / rotated.width);
        doc.addImage(rotated, "PNG", (210 - wmW) / 2, (297 - wmH) / 2, wmW, wmH);
        doc.setGState(new doc.GState({ opacity: 1 }));
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${p} / ${total}`, 105, 291, { align: "center" });
      }

      doc.save(
        `report_${slug(villageDetail.village.village)}_${slug(villageDetail.village.taluka)}.pdf`
      );
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          padding: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Spinner size={48} />
        <div style={{ color: C.navy, fontWeight: 600 }}>Loading reports...</div>
      </div>
    );

  if (!data)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: C.textopa,
          background: C.white,
          borderRadius: 14,
          border: "1px dashed #d8e0ea",
        }}
      >
        📭 Failed to load reports
      </div>
    );

  const { summary, byDistrict, byTaluka, byVillage } = data;

  const filteredTalukas = selectedDist
    ? byTaluka.filter((t) => t.dist === selectedDist)
    : byTaluka;

  const filteredVillages =
    selectedDist && selectedTaluka
      ? byVillage.filter((v) => v.dist === selectedDist && v.taluka === selectedTaluka)
      : selectedDist
      ? byVillage.filter((v) => v.dist === selectedDist)
      : byVillage;

  const formStatusSum =
    summary.totalSubmitted +
    summary.totalApproved +
    summary.totalRejected +
    summary.totalUnderReview +
    summary.totalDraft;
  const notStarted = Math.max(0, summary.totalUsers - formStatusSum);
  const statusAll = [
    { name: "Submitted", value: summary.totalSubmitted, color: "#F97316" },
    { name: "Approved", value: summary.totalApproved, color: C.green },
    { name: "Rejected", value: summary.totalRejected, color: "#dc2626" },
    { name: "Under Review", value: summary.totalUnderReview, color: "#7c3aed" },
    { name: "Draft", value: summary.totalDraft, color: "#6b7280" },
    { name: "Not Started", value: notStarted, color: "#94a3b8" },
  ];
  const pieData = statusAll.filter((s) => s.value > 0);
  const statusTotal = statusAll.reduce((a, b) => a + b.value, 0);

  const districtSource = showAllDistrict ? byDistrict : byDistrict.slice(0, 8);
  const districtChart = districtSource.map((d) => ({ ...d, label: renameDist(d.dist) }));
  const talukaSource = showAllTaluka ? filteredTalukas : filteredTalukas.slice(0, 15);
  const talukaChart = talukaSource.map((t) => ({
    ...t,
    label: selectedDist
      ? renameTaluka(t.taluka)
      : `${renameTaluka(t.taluka)} (${renameDist(t.dist)})`,
  }));
  const villageSource = showAllVillage ? filteredVillages : filteredVillages.slice(0, 15);
  const villageChart = villageSource.map((v) => ({ ...v, label: v.village }));

  const stats = [
    { label: "Total Users", value: summary.totalUsers, color: C.navy, icon: "👥" },
    { label: "Submitted", value: summary.totalSubmitted, color: "#F97316", icon: "📤" },
    { label: "Under Review", value: summary.totalUnderReview, color: "#7c3aed", icon: "🕐" },
    { label: "Approved", value: summary.totalApproved, color: C.green, icon: "✅" },
    { label: "Rejected", value: summary.totalRejected, color: "#dc2626", icon: "❌" },
    { label: "Draft", value: summary.totalDraft, color: "#6b7280", icon: "✏️" },
  ];

  const heroChips = [];
  if (selectedDist)
    heroChips.push({
      key: "dist",
      label: renameDist(selectedDist),
      onClick: () => {
        setSelectedDist(null);
        setSelectedTaluka(null);
      },
    });
  if (selectedTaluka)
    heroChips.push({
      key: "tal",
      label: renameTaluka(selectedTaluka),
      onClick: () => setSelectedTaluka(null),
    });

  const showAllToggle = (listLen, showAll, setShowAll, topN = 15) =>
    listLen > topN ? (
      <button
        className="pill-btn"
        onClick={() => setShowAll((v) => !v)}
        style={{
          background: "#f1f5f9",
          color: C.navy,
          border: "none",
          borderRadius: 999,
          padding: "5px 12px",
          fontSize: 11.5,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {showAll ? `Top ${topN}` : `Show all (${listLen})`}
      </button>
    ) : null;

  const modalOpen = villageLoading || villageDetail;

  return (
    <div style={{ padding: "24px 24px 44px", maxWidth: 1200, margin: "0 auto" }}>
      {/* ── Hero ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 18,
          background: "linear-gradient(135deg, #142952 0%, #1e3a6e 55%, #0f2040 100%)",
          padding: "24px 28px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -70,
            right: -50,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,.38) 0%, rgba(249,115,22,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: "rgba(255,255,255,.14)",
              border: "1px solid rgba(255,255,255,.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            📊
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 25, fontWeight: 800, letterSpacing: 0.2 }}>
              Reports &amp; Analytics
            </div>
            <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13, marginTop: 3 }}>
              Registration insights across districts, talukas &amp; villages
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          <button
            className="chip-glass"
            onClick={handleBack}
            style={{
              background: heroChips.length === 0 ? "#fff" : "rgba(255,255,255,.12)",
              color: heroChips.length === 0 ? C.navy : "#fff",
              border: `1px solid ${heroChips.length === 0 ? "#fff" : "rgba(255,255,255,.22)"}`,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12.5,
              fontWeight: heroChips.length === 0 ? 700 : 500,
              cursor: "pointer",
            }}
          >
            All Regions
          </button>
          {heroChips.map((chip) => (
            <button
              key={chip.key}
              className="chip-glass"
              onClick={chip.onClick}
              style={{
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.22)",
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {chip.label} <span style={{ opacity: 0.7, marginLeft: 4 }}>✕</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{
              background: C.white,
              borderRadius: 14,
              border: "1px solid #eaeef4",
              boxShadow: "0 4px 14px rgba(15,32,64,.05)",
              padding: "15px 17px",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: hexToRgba(s.color, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                marginBottom: 10,
              }}
            >
              {s.icon}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: C.textopa,
                marginTop: 5,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                fontWeight: 600,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row 1 ── */}
      <div className="reports-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Status Donut */}
        <Card
          icon="🥧"
          title="Status Overview"
          hint="Live form status distribution"
          tint="#7c3aed"
        >
          {pieData.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ width: 225, height: 225, position: "relative", flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={96}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                      animationDuration={600}
                    >
                      {pieData.map((s) => (
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
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.navy }}>{statusTotal}</div>
                  <div style={{ fontSize: 11, color: C.textopa }}>Total Users</div>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 8,
                  flex: 1,
                  minWidth: 250,
                }}
              >
                {statusAll.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      background: hexToRgba(s.color, 0.07),
                      borderRadius: 10,
                      padding: "7px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 3,
                          background: s.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: C.navy,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: s.color, flexShrink: 0 }}>
                      {s.value} · {statusTotal > 0 ? Math.round((s.value / statusTotal) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* District chart */}
        <Card
          icon="📍"
          title="District-wise Registration"
          hint="Click a bar to drill into talukas"
          tint={C.navy}
          action={showAllToggle(byDistrict.length, showAllDistrict, setShowAllDistrict, 8)}
        >
          {districtChart.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              style={
                showAllDistrict
                  ? { maxHeight: 560, overflowY: "auto" }
                  : undefined
              }
            >
            <ResponsiveContainer
              width="100%"
              height={Math.max(300, districtChart.length * 26 + 30)}
            >
              <BarChart data={districtChart} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradDistrict" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#142952" />
                    <stop offset="100%" stopColor="#2f5aa8" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef2f7" />
                <XAxis
                  type="number"
                  domain={[0, (dMax) => Math.ceil(dMax * 1.18) || 1]}
                  tick={tickStyle}
                  axisLine={{ stroke: "#eef2f7" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={165}
                  interval={0}
                  tick={{ fontSize: 11, fill: C.navy }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(20,41,82,0.05)" }} />
                <Bar
                  dataKey="count"
                  fill="url(#gradDistrict)"
                  radius={[0, 8, 8, 0]}
                  animationDuration={600}
                  style={{ cursor: "pointer" }}
                  onClick={(item) => {
                    if (item?.payload?.dist) setSelectedDist(item.payload.dist);
                  }}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{ fontSize: 12, fontWeight: 700, fill: "#334155" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ── Charts row 2 ── */}
      <div
        className="reports-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}
      >
        {/* Taluka chart */}
        <Card
          icon="🏘️"
          title={
            selectedDist
              ? `Taluka-wise — ${renameDist(selectedDist)}`
              : "Taluka-wise Registration"
          }
          hint="Click a bar to open villages"
          tint="#F97316"
          onBack={selectedDist ? handleBack : null}
          action={showAllToggle(filteredTalukas.length, showAllTaluka, setShowAllTaluka)}
        >
          {talukaChart.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              style={
                showAllTaluka
                  ? { maxHeight: 560, overflowY: "auto" }
                  : undefined
              }
            >
              <ResponsiveContainer
                width="100%"
                height={Math.max(300, talukaChart.length * 30 + 30)}
              >
                <BarChart data={talukaChart} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradTaluka" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#FDBA74" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef2f7" />
                  <XAxis
                    type="number"
                    domain={[0, (dMax) => Math.ceil(dMax * 1.18) || 1]}
                    tick={tickStyle}
                    axisLine={{ stroke: "#eef2f7" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={165}
                    interval={0}
                    tick={{ fontSize: 11, fill: C.navy }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(249,115,22,0.06)" }} />
                  <Bar
                    dataKey="count"
                    fill="url(#gradTaluka)"
                    radius={[0, 8, 8, 0]}
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
                      style={{ fontSize: 12, fontWeight: 700, fill: "#334155" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Village chart */}
        <Card
          icon="🏠"
          title={
            selectedTaluka
              ? `Village-wise — ${renameTaluka(selectedTaluka)}, ${renameDist(selectedDist)}`
              : selectedDist
              ? `Village-wise — ${renameDist(selectedDist)}`
              : "Village-wise Registration"
          }
          hint="Click a bar to see registered users"
          tint={C.green}
          onBack={selectedTaluka || selectedDist ? handleBack : null}
          action={showAllToggle(filteredVillages.length, showAllVillage, setShowAllVillage)}
        >
          {villageChart.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              style={
                showAllVillage
                  ? { maxHeight: 560, overflowY: "auto" }
                  : undefined
              }
            >
              <ResponsiveContainer
                width="100%"
                height={Math.max(300, villageChart.length * 30 + 30)}
              >
                <BarChart data={villageChart} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradVillage" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1A7A3C" />
                      <stop offset="100%" stopColor="#4ade80" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#eef2f7" />
                  <XAxis
                    type="number"
                    domain={[0, (dMax) => Math.ceil(dMax * 1.18) || 1]}
                    tick={tickStyle}
                    axisLine={{ stroke: "#eef2f7" }}
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
                    fill="url(#gradVillage)"
                    radius={[0, 8, 8, 0]}
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
                      style={{ fontSize: 12, fontWeight: 700, fill: "#334155" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ── Village users modal ── */}
      {modalOpen && (
        <div
          className="modal-fade"
          onClick={handleBack}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "rgba(15,32,64,.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            className="modal-rise"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 18,
              width: "min(780px, 100%)",
              maxHeight: "86vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 30px 60px rgba(15,32,64,.35)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                background: C.white,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 22px",
                borderBottom: "1px solid #eef2f7",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 750, color: C.navy }}>
                  {villageDetail
                    ? villageDetail.village.village
                    : "Loading users..."}
                </div>
                {villageDetail && (
                  <div style={{ fontSize: 12.5, color: C.textopa, marginTop: 2 }}>
                    {renameTaluka(villageDetail.village.taluka)},{" "}
                    {renameDist(villageDetail.village.dist)}
                  </div>
                )}
              </div>
              {villageDetail && (
                <span
                  style={{
                    background: "#ecfdf5",
                    color: C.green,
                    borderRadius: 999,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {villageDetail.total} registrations
                </span>
              )}
              {villageDetail && villageDetail.users.length > 0 && (
                <button
                  onClick={downloadReportPdf}
                  disabled={pdfBusy}
                  className="pill-btn"
                  style={{
                    background: pdfBusy ? "#94a3b8" : C.navy,
                    color: "#fff",
                    border: "none",
                    borderRadius: 999,
                    padding: "7px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: pdfBusy ? "default" : "pointer",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {pdfBusy ? "Preparing..." : "⬇ PDF"}
                </button>
              )}
              <button
                onClick={handleBack}
                aria-label="Close"
                className="pill-btn"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  border: "none",
                  fontSize: 16,
                  color: C.navy,
                  cursor: "pointer",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {villageLoading ? (
              <div
                style={{
                  padding: 50,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Spinner size={42} />
                <div style={{ color: C.textopa, fontWeight: 600, fontSize: 13 }}>
                  Loading users...
                </div>
              </div>
            ) : !villageDetail || villageDetail.users.length === 0 ? (
              <div
                style={{
                  margin: 22,
                  padding: 34,
                  textAlign: "center",
                  color: C.textopa,
                  background: "#f8fafc",
                  borderRadius: 12,
                  border: "1px dashed #d8e0ea",
                  fontSize: 13.5,
                }}
              >
                📭 No users found
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["#", "ID", "Name", "Mobile", "Status", "Submitted"].map((h) => (
                        <th
                          key={h}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            background: C.navy,
                            color: "#fff",
                            padding: "10px 14px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {villageDetail.users.map((u, i) => (
                      <tr
                        key={u._id}
                        className="data-row"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
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
                        <td style={{ padding: "10px 14px", fontSize: 14 }}>{u.mobile || "—"}</td>
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
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, hint, icon, tint, onBack, action, children }) {
  return (
    <div
      className="chart-card"
      style={{
        background: C.white,
        borderRadius: 16,
        border: "1px solid #eef1f6",
        boxShadow: "0 6px 20px rgba(15,32,64,.06)",
        padding: 20,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 11,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid #f1f4f8",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: hexToRgba(tint, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h3 style={{ color: C.navy, fontWeight: 750, margin: 0, fontSize: 15 }}>{title}</h3>
            {onBack && (
              <button
                className="pill-btn"
                onClick={onBack}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: 999,
                  padding: "4px 11px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 11.5,
                  color: C.navy,
                  flexShrink: 0,
                }}
              >
                ← Back
              </button>
            )}
            {action}
          </div>
          <div style={{ fontSize: 11, color: C.textopa, marginTop: 3 }}>{hint}</div>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>{children}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: 34,
        textAlign: "center",
        color: C.textopa,
        background: "#f8fafc",
        borderRadius: 12,
        border: "1px dashed #d8e0ea",
        fontSize: 13.5,
      }}
    >
      📭 No data
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
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

const tooltipBox = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "9px 13px",
  boxShadow: "0 10px 30px rgba(15,32,64,.15)",
  fontSize: 13,
};

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div style={tooltipBox}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4 }}>{row.label}</div>
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
        <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
        <span style={{ fontWeight: 700, color: C.navy }}>{p.name}</span>
        <span style={{ color: C.textopa }}>{p.value}</span>
      </div>
    </div>
  );
}
