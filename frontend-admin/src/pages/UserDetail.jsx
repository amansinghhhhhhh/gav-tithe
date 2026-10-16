import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetail, updateUserStatus, updateEditAllowed, getDocUrl, getFormPdfUrl, getFormDocxUrl } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";
import { override } from "../constants/placeRename";
import { Avatar } from "../utils/avatar.jsx";

const renameDist = (s) => override("district", "en", s) || s;
const renameTaluka = (s) => override("taluka", "en", s) || s;

const STATUS_BADGE = {
  draft: { bg: "#f3f4f6", color: "#6b7280", label: "Draft" },
  submitted: { bg: "#fff7ed", color: "#F97316", label: "Submitted" },
  under_review: { bg: "#ede9fe", color: "#7c3aed", label: "Under Review" },
  approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
  not_started: { bg: "#f3f4f6", color: "#6b7280", label: "Not Started" },
};

const STATUS_OPTS = [
  { v: "submitted", label: "Submitted", dot: "#F97316" },
  { v: "under_review", label: "Under Review", dot: "#7c3aed" },
  { v: "approved", label: "Approved", dot: "#16a34a" },
  { v: "rejected", label: "Rejected", dot: "#dc2626" },
];

const DOC_LIST = [
  { key: "aadhaarFront", label: "Aadhaar Front" },
  { key: "aadhaarBack", label: "Aadhaar Back" },
  { key: "pan", label: "PAN" },
  { key: "udyam", label: "Udyam" },
  { key: "passport", label: "Passport Photo" },
];

const fmtDate = (value, emptyText = "—") =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : emptyText;

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [editAllowed, setEditAllowed] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [tab, setTab] = useState("info");

  useEffect(() => {
    getUserDetail(userId).then((res) => {
      if (res.success) {
        setData(res);
        setStatus(res.form?.status || "");
        setRemark(res.form?.adminRemark || "");
        setEditAllowed(!!res.form?.editAllowed);
      }
      setLoading(false);
    });
  }, [userId]);

  const handleUpdate = async () => {
    setSaving(true);
    const res = await updateUserStatus(userId, status, remark);
    setSaving(false);
    if (res.success) setMsg("✅ Status updated!");
    else setMsg("❌ Update failed");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEditToggle = async (allow) => {
    setEditSaving(true);
    const res = await updateEditAllowed(userId, allow, remark);
    setEditSaving(false);
    if (res.success) {
      setEditAllowed(allow);
      setMsg(allow ? "✅ Edit access granted" : "✅ Edit access revoked");
    } else {
      setMsg("❌ " + (res.message || "Update failed"));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  if (loading)
    return (
      <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Spinner size={52} />
        <div style={{ color: C.maroon, fontWeight: 600 }}>Loading...</div>
      </div>
    );
  if (!data) return <div style={{ padding: 40 }}>User not found</div>;

  const { user, form } = data;
  const s1 = form?.section1 || {};
  const s2 = form?.section2 || {};
  const s3 = form?.section3 || {};
  const s4 = form?.section4 || {};

  const addr = s1.address || {};
  const addressDisplay = typeof addr === "string" ? addr : null;

  const displayName = s1.fullName || user.name || "User Detail";
  const badge = STATUS_BADGE[form?.status] || STATUS_BADGE.not_started;
  const docsUploaded = DOC_LIST.filter((d) => s4.docs?.[d.key]).length;
  const locBits = [
    addr.dist && renameDist(addr.dist),
    addr.taluka && renameTaluka(addr.taluka),
  ].filter(Boolean);

  return (
    <div style={{ padding: "28px 24px", maxWidth: "none" }}>
      {/* ── Hero banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #142952, #1e3a6e)",
          borderRadius: 16,
          padding: "22px 26px",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(20,41,82,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <button
            className="hero-btn"
            onClick={() => navigate("/users")}
            style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", color: "#fff" }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="hero-btn" href={getFormPdfUrl(userId)} target="_blank" rel="noreferrer" style={{ background: "#fff", color: C.navy, border: "1px solid #fff", textDecoration: "none" }}>
              ⬇ PDF
            </a>
            <a className="hero-btn" href={getFormDocxUrl(userId)} target="_blank" rel="noreferrer" style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.5)", textDecoration: "none" }}>
              ⬇ DOCX
            </a>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18, flexWrap: "wrap" }}>
          <Avatar name={displayName} size={64} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{displayName}</div>
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
              {form?.uniqueId && (
                <span
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    borderRadius: 7,
                    padding: "4px 11px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    letterSpacing: "0.5px",
                  }}
                >
                  {form.uniqueId}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              <span>📅 Registered: <b style={{ color: "#fff" }}>{fmtDate(user?.createdAt)}</b></span>
              <span>
                📅 Submitted:{" "}
                <b style={{ color: "#fff" }}>{fmtDate(form?.submittedAt, "Not submitted yet")}</b>
              </span>
              {locBits.length > 0 && <span>📍 {locBits.join(", ")}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {msg && (
        <div
          className="modal-fade"
          style={{
            background: msg.includes("✅") ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${msg.includes("✅") ? "#86efac" : "#fca5a5"}`,
            color: msg.includes("✅") ? "#166534" : "#991b1b",
            padding: "10px 16px",
            borderRadius: 10,
            margin: "16px 0 0",
            fontWeight: 600,
            fontSize: 13.5,
          }}
        >
          {msg}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="ud-tabs">
        <button className={`ud-tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>
          👤 Info
        </button>
        <button className={`ud-tab ${tab === "docs" ? "active" : ""}`} onClick={() => setTab("docs")}>
          📎 Documents ({docsUploaded}/{DOC_LIST.length})
        </button>
        <button className={`ud-tab ${tab === "actions" ? "active" : ""}`} onClick={() => setTab("actions")}>
          ⚙️ Actions
        </button>
      </div>

      {/* ── Tab: Info ── */}
      {tab === "info" && (
        <div className="ud-grid">
          <Card title="Personal Info" icon="👤">
            <Row label="Full Name" value={s1.fullName} />
            <Row label="DOB" value={s1.dob} />
            <Row label="Gender" value={s1.gender} />
            <Row label="Mobile" value={s1.mobile} />
            <Row label="Email" value={s1.email} />
            <Row label="Education" value={s1.education} />
            <Row label="Referred By" value={s1.referredBy} />
            <Row label="Referrer Mobile" value={s1.referrerMobile} />
            {addressDisplay !== null ? (
              <Row label="Address" value={addressDisplay} />
            ) : (
              <>
                <Row label="District" value={renameDist(addr.dist)} />
                <Row label="Taluka" value={renameTaluka(addr.taluka)} />
                <Row label="Village" value={addr.village === "__other__" ? (addr.villageCustom || "Other") : addr.village} />
                <Row label="Pincode" value={addr.pincode} />
              </>
            )}
          </Card>

          <Card title="Business Info" icon="🏢">
            <Row label="Business Name" value={s2.businessName} />
            <Row label="Type" value={s2.businessType} />
            <Row label="Sector" value={s2.sector === "other" ? `Other — ${s2.sectorOther || ""}` : s2.sector} />
            <Row label="Status" value={s2.businessStatus} />
            <Row label="Employment" value={s2.employment} />
            <Row label="Investment" value={s2.investment && `₹ ${s2.investment}`} />
          </Card>

          <Card title="Financial Info" icon="💰">
            <Row label="Had Loan" value={s3.hadLoan} />
            <Row label="Loan Type" value={s3.loanType === "other" ? `Other — ${s3.loanTypeOther || ""}` : s3.loanType} />
            <Row label="Repayment" value={s3.repaymentStatus} />
            <Row label="CIBIL Score" value={s3.cibilScore} />
            <Row label="Difficulty" value={s3.pastDifficulty} />
          </Card>

          <Card title="KYC Details" icon="📄">
            <Row label="Aadhaar" value={s4.aadhaar} />
            <Row label="PAN" value={s4.pan} />
            <Row label="Udyam" value={s4.udyam} />
            <Row label="Bank" value={s4.bankName} />
            <Row label="Account No" value={s4.accountNo} />
          </Card>
        </div>
      )}

      {/* ── Tab: Documents ── */}
      {tab === "docs" && (
        <div className="ud-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}>
          {DOC_LIST.map(({ key, label }) => {
            const fileId = s4.docs?.[key];
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
                <div
                  style={{
                    position: "relative",
                    height: 130,
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: 34, opacity: 0.85 }}>{fileId ? "📄" : "🚫"}</div>
                  {fileId && (
                    <img
                      src={getDocUrl(fileId)}
                      alt={label}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        background: "#fff",
                      }}
                    />
                  )}
                  {fileId && (
                    <a
                      className="doc-view"
                      href={getDocUrl(fileId)}
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
                      }}
                    >
                      🔍 View
                    </a>
                  )}
                </div>
                <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: fileId ? "#16a34a" : "#94a3b8",
                    }}
                  >
                    {fileId ? "✓ Uploaded" : "Not uploaded"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Actions ── */}
      {tab === "actions" && (
        <div className="ud-grid">
          {/* Status update */}
          <Card title="Update Status" icon="🎯">
            <div style={{ fontSize: 12, color: C.textopa, marginBottom: 4 }}>Current status</div>
            <div className="ud-seg" style={{ marginBottom: 16 }}>
              {STATUS_OPTS.map((o) => (
                <button
                  key={o.v}
                  className={status === o.v ? "active" : ""}
                  onClick={() => setStatus(o.v)}
                >
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
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </Card>

          {/* Edit access */}
          <Card title="Edit Access" icon="✏️">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "6px 0" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  {editAllowed ? "User can edit form" : "Form is locked"}
                </div>
                <div style={{ fontSize: 12.5, color: C.textopa, marginTop: 4 }}>
                  {editAllowed
                    ? "Revise karne par user form dobara edit kar sakega."
                    : "Allow karne par user submitted form edit kar sakega."}
                </div>
              </div>
              <button
                onClick={() => handleEditToggle(!editAllowed)}
                disabled={editSaving}
                aria-label="Toggle edit access"
                style={{
                  width: 54,
                  height: 30,
                  borderRadius: 20,
                  border: "none",
                  background: editSaving ? "#94a3b8" : editAllowed ? "#16a34a" : "#cbd5e1",
                  position: "relative",
                  cursor: editSaving ? "default" : "pointer",
                  flexShrink: 0,
                  transition: "background .18s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    left: editAllowed ? 28 : 4,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                    transition: "left .18s",
                  }}
                />
              </button>
            </div>
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: editAllowed ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${editAllowed ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 10,
                fontSize: 12.5,
                color: editAllowed ? "#166534" : "#991b1b",
                fontWeight: 600,
              }}
            >
              {editAllowed ? "🟢 Edit allowed — user ke liye form open hai." : "🔒 Locked — user form edit nahi kar payega."}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

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
            background: `${C.navy}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
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
      <span style={{ fontWeight: 600, color: "#0f172a", textAlign: "right", wordBreak: "break-word" }}>
        {value || "—"}
      </span>
    </div>
  );
}
