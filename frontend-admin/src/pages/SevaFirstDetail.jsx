import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";
import {
  ArrowLeft, Download, Calendar, MapPin, Lightbulb, Paperclip, Settings,
  User, Users, Coins, FileText, Ban, Search, Check, Target, Save, Info,
  CheckCircle2, XCircle, Trash2,
} from "lucide-react";
import { getSevaDetail, updateSevaStatus, getSevaFileUrl, deleteSevaApplication } from "../services/api";
import { Avatar } from "../utils/avatar.jsx";

const STATUS_BADGE = {
  submitted: { bg: "#fff7ed", color: "#F97316", label: "Submitted" },
  under_review: { bg: "#ede9fe", color: "#7c3aed", label: "Under Review" },
  approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
};

const STATUS_OPTS = [
  { v: "submitted", label: "Submitted", dot: "#F97316" },
  { v: "under_review", label: "Under Review", dot: "#7c3aed" },
  { v: "approved", label: "Approved", dot: "#16a34a" },
  { v: "rejected", label: "Rejected", dot: "#dc2626" },
];

const DOC_LIST = [
  { key: "ppt", label: "SEVA FIRST PPT", required: true },
  { key: "idProof", label: "Aadhaar / PAN Doc", required: true },
  { key: "prototype", label: "Prototype Files", required: false },
  { key: "research", label: "Research Paper", required: false },
];

const fmtDate = (v, empty = "—") =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : empty;

export default function SevaFirstDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState(true);
  const [tab, setTab] = useState("info");

  useEffect(() => {
    getSevaDetail(id).then((res) => {
      if (res.success) {
        setApp(res.application);
        setStatus(res.application.status || "submitted");
        setRemark(res.application.adminRemark || "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    const res = await updateSevaStatus(id, status, remark);
    setSaving(false);
    if (res.success) {
      setApp(res.application);
      setMsg("Status updated!");
      setMsgOk(true);
    } else {
      setMsg(res.message || "Update failed");
      setMsgOk(false);
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm(`Delete "${app.uniqueId}" (${app.applicant?.name || "applicant"})?`)) return;
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setDeleting(true);
    const res = await deleteSevaApplication(id).catch(() => null);
    setDeleting(false);
    if (res?.success) {
      navigate("/seva-first");
    } else {
      setMsg(res?.message || "Delete failed");
      setMsgOk(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Spinner size={52} />
        <div style={{ color: C.maroon, fontWeight: 600 }}>Loading...</div>
      </div>
    );
  if (!app) return <div style={{ padding: 40 }}>Application not found</div>;

  const { applicant, teamMembers, idea, budget, files } = app;
  const badge = STATUS_BADGE[app.status] || STATUS_BADGE.submitted;

  return (
    <div style={{ padding: "28px 24px", maxWidth: "none" }}>
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg, #e65100, #b45309)",
          borderRadius: 16,
          padding: "22px 26px",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(230,81,0,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button
            className="hero-btn"
            onClick={() => navigate("/seva-first")}
            style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          {files?.ppt && (
            <a
              className="hero-btn"
              href={getSevaFileUrl(files.ppt)}
              target="_blank"
              rel="noreferrer"
              style={{ background: "#fff", color: BRAND_ORANGE, border: "1px solid #fff", textDecoration: "none" }}
            >
              <Download size={14} /> PPT
            </a>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18, flexWrap: "wrap" }}>
          <Avatar name={applicant?.name || "Seva"} size={64} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{applicant?.name || "—"}</div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: badge.bg,
                  color: badge.color,
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: badge.color }} />
                {badge.label}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 7,
                  padding: "4px 11px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                }}
              >
                {app.uniqueId}
              </span>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Calendar size={14} /> Submitted: <b style={{ color: "#fff" }}>{fmtDate(app.createdAt)}</b></span>
              {applicant?.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={14} /> {applicant.location}</span>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Lightbulb size={14} /> {idea?.category?.split(" (")[0] || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div
          className="modal-fade"
          style={{
            background: msgOk ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${msgOk ? "#86efac" : "#fca5a5"}`,
            color: msgOk ? "#166534" : "#991b1b",
            padding: "10px 16px",
            borderRadius: 10,
            margin: "16px 0 0",
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

      {/* Tabs */}
      <div className="ud-tabs">
        <button className={`ud-tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>
          <Lightbulb size={15} /> Idea & Applicant
        </button>
        <button className={`ud-tab ${tab === "docs" ? "active" : ""}`} onClick={() => setTab("docs")}>
          <Paperclip size={15} /> Documents
        </button>
        <button className={`ud-tab ${tab === "actions" ? "active" : ""}`} onClick={() => setTab("actions")}>
          <Settings size={15} /> Actions
        </button>
      </div>

      {/* Tab: Info */}
      {tab === "info" && (
        <div className="ud-grid">
          <Card title="Applicant Details" icon={<User size={17} />}>
            <Row label="Full Name" value={applicant?.name} />
            <Row label="Mobile" value={applicant?.mobile} />
            <Row label="Email" value={applicant?.email} />
            <Row label="District & Taluka" value={applicant?.location} />
            <Row label="Aadhaar" value={applicant?.aadhaar} />
            <Row label="PAN" value={applicant?.pan} />
          </Card>

          <Card title="Team Members" icon={<Users size={17} />}>
            {teamMembers?.length ? (
              teamMembers.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "9px 0",
                    borderBottom: "1px dashed #eef2f7",
                  }}
                >
                  <Avatar name={m.name || "?"} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{m.name || "—"}</div>
                    <div style={{ fontSize: 12, color: C.textopa }}>
                      {m.role || "—"} · {m.contact || "—"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 13, color: C.textopa, padding: "8px 0" }}>Solo applicant (no team members)</div>
            )}
          </Card>

          <Card title="Innovation Idea" icon={<Lightbulb size={17} />}>
            <Row label="Category" value={idea?.category} />
            <div style={{ padding: "10px 0", borderBottom: "1px dashed #eef2f7" }}>
              <div style={{ color: C.textopa, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                Problem Statement
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#0f172a" }}>{idea?.problem || "—"}</div>
            </div>
            <div style={{ padding: "10px 0" }}>
              <div style={{ color: C.textopa, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                Proposed Solution
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#0f172a" }}>{idea?.solution || "—"}</div>
            </div>
          </Card>

          <Card title="Budget & DPR" icon={<Coins size={17} />}>
            <Row label="Estimated Cost" value={budget?.cost ? `₹ ${Number(budget.cost).toLocaleString("en-IN")}` : ""} />
            <Row label="Timeline" value={budget?.timelineMonths ? `${budget.timelineMonths} months` : ""} />
            <Row label="Video / Drive Link" value={budget?.videoLink} />
            <div style={{ padding: "10px 0" }}>
              <div style={{ color: C.textopa, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                Implementation Plan
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#0f172a" }}>{budget?.implementationPlan || "—"}</div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Documents */}
      {tab === "docs" && (
        <div className="ud-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          {DOC_LIST.map(({ key, label, required }) => {
            const fileId = files?.[key];
            return (
              <div
                key={key}
                className="doc-wrap"
                style={{
                  background: C.white,
                  border: `1.5px solid ${fileId ? "#86efac" : "#e2e8f0"}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ position: "relative", height: 130, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ opacity: 0.85 }}>{fileId ? <FileText size={34} /> : <Ban size={34} />}</div>
                  {fileId && (
                    <a
                      className="doc-view"
                      href={getSevaFileUrl(fileId)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(15,23,42,0.55)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        gap: 6,
                      }}
                    >
                      <Search size={14} /> View / Download
                    </a>
                  )}
                </div>
                <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: fileId ? "#16a34a" : required ? "#dc2626" : "#94a3b8", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {fileId ? <><Check size={12} strokeWidth={3} /> Uploaded</> : required ? "Required" : "Optional"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Actions */}
      {tab === "actions" && (
        <div className="ud-grid">
          <Card title="Update Status" icon={<Target size={17} />}>
            <div style={{ fontSize: 12, color: C.textopa, marginBottom: 4 }}>Current status</div>
            <div className="ud-seg" style={{ marginBottom: 16 }}>
              {STATUS_OPTS.map((o) => (
                <button key={o.v} className={status === o.v ? "active" : ""} onClick={() => setStatus(o.v)}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: o.dot, display: "inline-block", marginRight: 6 }} />
                  {o.label}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 12, color: C.textopa, display: "block", marginBottom: 6, fontWeight: 700 }}>
              Remark (optional)
            </label>
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Admin remark..."
              className="admin-search"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #cbd5e1",
                borderRadius: 10,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                background: C.white,
                marginBottom: 16,
              }}
            />
            <button
              className="btn-navy"
              onClick={handleUpdate}
              disabled={saving}
              style={{
                padding: "10px 26px",
                background: C.navy,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Save size={14} /> Save Changes</span>}
            </button>
          </Card>

          <Card title="Application Info" icon={<Info size={17} />}>
            <Row label="Application ID" value={app.uniqueId} />
            <Row label="Status" value={badge.label} />
            <Row label="Submitted" value={fmtDate(app.createdAt)} />
            <Row label="Team Size" value={teamMembers?.length ? String(teamMembers.length) : "Solo"} />
            <Row label="Admin Remark" value={app.adminRemark} />
          </Card>

          <Card title="Danger Zone" icon={<Ban size={17} />}>
            <div style={{ fontSize: 12.5, color: C.textopa, marginBottom: 12, lineHeight: 1.6 }}>
              Permanently delete this application. Ye wapas nahi aayega — applicant ke paas se bhi gayab ho jayega.
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: "10px 22px",
                background: "#fff",
                color: "#dc2626",
                border: "1.5px solid #fca5a5",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: deleting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {deleting ? "Deleting..." : <><Trash2 size={15} /> Delete Application</>}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

const BRAND_ORANGE = "#e65100";

function Card({ title, icon, children }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #eef2f7",
        overflow: "hidden",
        alignSelf: "start",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid #f1f5f9",
          background: "#f8fafc",
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "#e6510012",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            color: "#e65100",
          }}
        >
          {icon}
        </span>
        <h3 style={{ color: C.navy, fontWeight: 700, margin: 0, fontSize: 14.5 }}>{title}</h3>
      </div>
      <div style={{ padding: "10px 18px 14px" }}>{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 14,
        fontSize: 13,
        padding: "8px 0",
        borderBottom: "1px dashed #eef2f7",
      }}
    >
      <span
        style={{
          color: C.textopa,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span style={{ fontWeight: 600, color: "#0f172a", textAlign: "right", wordBreak: "break-word" }}>{value || "—"}</span>
    </div>
  );
}
