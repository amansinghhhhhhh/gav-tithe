import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";
import { getSevaList, deleteSevaApplication, getSevaExcelUrl, getSevaZipUrl } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import { Lightbulb, Search, FolderOpen, Eye, XCircle, Trash2, CheckCircle2, Layers, FileText, Clock, Download, FileArchive } from "lucide-react";

const STATUS_BADGE = {
  submitted: { bg: "#fff7ed", color: "#F97316", label: "Submitted" },
  under_review: { bg: "#ede9fe", color: "#7c3aed", label: "Under Review" },
  approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
};

const DOC_TYPES = [
  { v: "ppt", label: "PPT" },
  { v: "idProof", label: "ID Proof" },
  { v: "prototype", label: "Prototype" },
  { v: "research", label: "Research" },
];

const FILTERS = [
  { v: "", label: "All" },
  { v: "submitted", label: "Submitted" },
  { v: "under_review", label: "Under Review" },
  { v: "approved", label: "Approved" },
  { v: "rejected", label: "Rejected" },
];

const CARDS = [
  { key: "total", label: "Total Applications", color: C.navy, bg: "#eef2ff", icon: <Layers size={18} />, filter: "" },
  { key: "submitted", label: "Submitted", color: "#F97316", bg: "#fff7ed", icon: <FileText size={18} />, filter: "submitted" },
  { key: "under_review", label: "Under Review", color: "#7c3aed", bg: "#ede9fe", icon: <Clock size={18} />, filter: "under_review" },
  { key: "approved", label: "Approved", color: "#16a34a", bg: "#dcfce7", icon: <CheckCircle2 size={18} />, filter: "approved" },
  { key: "rejected", label: "Rejected", color: "#dc2626", bg: "#fee2e2", icon: <XCircle size={18} />, filter: "rejected" },
];

function StatusBadge({ status }) {
  const b = STATUS_BADGE[status] || STATUS_BADGE.submitted;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: b.bg,
        color: b.color,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.color }} />
      {b.label}
    </span>
  );
}

export default function SevaFirstList() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [counts, setCounts] = useState({ total: 0, submitted: 0, under_review: 0, approved: 0, rejected: 0 });
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmApp, setConfirmApp] = useState(null);
  const [docs, setDocs] = useState(DOC_TYPES.map((d) => d.v));

  const toggleDoc = (v) => {
    setDocs((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const showMsg = (text, ok = false) => {
    setMsgOk(ok);
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const load = async (search = q, st = status) => {
    setLoading(true);
    const res = await getSevaList({ q: search, status: st }).catch(() => null);
    if (res?.success) {
      setApps(res.applications || []);
      if (res.counts) setCounts(res.counts);
    } else {
      showMsg(res?.message || "Load failed", false);
    }
    setLoading(false);
  };

  useEffect(() => {
    load("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (v) => {
    setQ(v);
    load(v, status);
  };

  const onFilter = (v) => {
    setStatus(v);
    load(q, v);
  };

  const handleDelete = async (app) => {
    if (deletingId) return;
    setDeletingId(app._id);
    const res = await deleteSevaApplication(app._id).catch(() => null);
    setDeletingId(null);
    if (res?.success) {
      setApps((prev) => prev.filter((a) => a._id !== app._id));
      setCounts((c) => ({
        ...c,
        total: Math.max(0, c.total - 1),
        [app.status]: Math.max(0, (c[app.status] || 0) - 1),
      }));
      showMsg("Application deleted!", true);
    } else {
      showMsg(res?.message || "Delete failed", false);
    }
  };

  return (
    <div style={{ padding: "28px 24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h1 style={{ color: C.navy, fontSize: 24, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 9 }}>
            <Lightbulb size={24} color="#e65100" /> Seva First Applications
          </h1>
          <p style={{ color: C.textopa, fontSize: 13.5, margin: "5px 0 0" }}>
            Seva First Innovation Challenge — total {counts.total} application{counts.total === 1 ? "" : "s"}
          </p>
        </div>
        <a
          href={getSevaExcelUrl()}
          style={{
            padding: "9px 18px",
            background: "#16a34a",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            whiteSpace: "nowrap",
          }}
        >
          <Download size={15} /> Export Excel
        </a>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        {CARDS.map((card) => {
          const active = status === card.filter;
          return (
            <button
              key={card.key}
              onClick={() => onFilter(card.filter)}
              style={{
                flex: "1 1 150px",
                minWidth: 140,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                background: C.white,
                border: active ? `2px solid ${card.color}` : "2px solid transparent",
                borderRadius: 12,
                boxShadow: active ? "0 4px 14px rgba(0,0,0,0.10)" : "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                textAlign: "left",
                transition: "box-shadow 0.15s ease",
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: card.bg,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </span>
              <span>
                <span style={{ display: "block", fontSize: 22, fontWeight: 800, color: card.color, lineHeight: 1.1 }}>
                  {counts[card.key] ?? 0}
                </span>
                <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: C.textopa, marginTop: 2 }}>
                  {card.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {msg && (
        <div
          className="modal-fade"
          style={{
            background: msgOk ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${msgOk ? "#86efac" : "#fca5a5"}`,
            color: msgOk ? "#166534" : "#991b1b",
            padding: "10px 16px",
            borderRadius: 10,
            marginBottom: 14,
            fontWeight: 600,
            fontSize: 13.5,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          {msgOk ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {msg}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 380 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search SF ID, name, mobile..."
            className="admin-search"
            style={{
              width: "100%",
              padding: "10px 16px 10px 34px",
              border: "1.5px solid #cbd5e1",
              borderRadius: 10,
              fontSize: 13.5,
              outline: "none",
              background: C.white,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => onFilter(f.v)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: status === f.v ? "none" : "1.5px solid #cbd5e1",
                background: status === f.v ? C.navy : C.white,
                color: status === f.v ? "#fff" : C.textopa,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Docs selector + ZIP download */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: C.textopa, textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 2 }}>
          Documents:
        </span>
        {DOC_TYPES.map((d) => {
          const on = docs.includes(d.v);
          return (
            <button
              key={d.v}
              onClick={() => toggleDoc(d.v)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: on ? "none" : "1.5px solid #cbd5e1",
                background: on ? "#F97316" : C.white,
                color: on ? "#fff" : C.textopa,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {d.label}
            </button>
          );
        })}
        <a
          href={docs.length ? getSevaZipUrl({ q, status, docs }) : undefined}
          aria-disabled={!docs.length}
          title={docs.length ? "Filtered users ke selected documents ZIP me download honge" : "Kam se kam ek document type select karo"}
          style={{
            marginLeft: 6,
            padding: "8px 18px",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            whiteSpace: "nowrap",
            background: docs.length ? C.navy : "#e2e8f0",
            color: docs.length ? "#fff" : "#94a3b8",
            cursor: docs.length ? "pointer" : "not-allowed",
            pointerEvents: docs.length ? "auto" : "none",
          }}
        >
          <FileArchive size={15} /> Download ZIP
        </a>
      </div>

      {/* Table */}
      <div
        style={{
          background: C.white,
          borderRadius: 14,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "56px 0" }}>
            <Spinner size={42} />
            <div style={{ color: C.maroon, fontWeight: 600 }}>Loading applications...</div>
          </div>
        ) : apps.length === 0 ? (
          <div style={{ padding: "56px 0", textAlign: "center", color: C.textopa, fontSize: 14, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <FolderOpen size={32} />
            No applications found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="list-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.navy, color: "#fff" }}>
                  {["SF ID", "Applicant", "Category", "Mobile", "Location", "Cost", "Status", "Date", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 800,
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
                {apps.map((app) => (
                  <tr
                    key={app._id}
                    onClick={() => navigate(`/seva-first/${app._id}`)}
                    className="data-row"
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: 12.5,
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          borderRadius: 7,
                          padding: "3px 9px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {app.uniqueId}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#0f172a", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={app.applicant?.name}>
                      {app.applicant?.name || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: C.textopa, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={app.idea?.category}>
                      {app.idea?.category?.split(" (")[0] || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, whiteSpace: "nowrap" }}>{app.applicant?.mobile || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: C.textopa, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={app.applicant?.location}>
                      {app.applicant?.location || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {app.budget?.cost ? `₹${Number(app.budget.cost).toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: C.textopa, whiteSpace: "nowrap" }}>
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seva-first/${app._id}`);
                        }}
                        className="btn-navy"
                        style={{ padding: "6px 14px", background: C.navy, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
                      >
                        <Eye size={13} /> View
                      </button>{" "}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmApp(app);
                        }}
                        disabled={deletingId === app._id}
                        className="btn-ghost-red"
                        style={{
                          padding: "6px 12px",
                          background: "#fff",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: deletingId === app._id ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          opacity: deletingId && deletingId !== app._id ? 0.55 : 1,
                        }}
                      >
                        {deletingId === app._id ? "Deleting..." : <><Trash2 size={12} /> Del</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmApp}
        title={`Delete "${confirmApp?.uniqueId}"?`}
        message={`${confirmApp?.applicant?.name || "This application"} — ye application permanently delete ho jayegi.\nThis cannot be undone.`}
        loading={!!deletingId}
        onCancel={() => setConfirmApp(null)}
        onConfirm={async () => {
          await handleDelete(confirmApp);
          setConfirmApp(null);
        }}
      />
    </div>
  );
}
