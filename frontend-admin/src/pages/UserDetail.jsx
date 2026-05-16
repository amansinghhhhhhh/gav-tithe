import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetail, updateUserStatus, openDoc } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getUserDetail(userId).then((res) => {
      if (res.success) {
        setData(res);
        setStatus(res.form?.status || "");
        setRemark(res.form?.adminRemark || "");
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

  // ✅ address object ya string dono handle karo
  const addr = s1.address || {};
  const addressDisplay =
    typeof addr === "string"
      ? addr // purana string data
      : null; // naya object data — alag rows dikhenge

  return (
    <div style={{ padding: "28px 24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => navigate("/users")}
          style={{
            background: C.light,
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Back
        </button>
        <h2 style={{ color: C.navy, fontWeight: 800, margin: 0 }}>
          {s1.fullName || user.name || "User Detail"}
        </h2>
      </div>

      {msg && (
        <div
          style={{
            background: msg.includes("✅") ? "#dcfce7" : "#fee2e2",
            border: `1px solid ${msg.includes("✅") ? "#86efac" : "#fca5a5"}`,
            color: msg.includes("✅") ? "#166534" : "#991b1b",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Section 1 — Personal Info */}
        <Card title="Personal Info" icon="👤">
          <Row label="Full Name" value={s1.fullName} />
          <Row label="DOB" value={s1.dob} />
          <Row label="Gender" value={s1.gender} />
          <Row label="Mobile" value={s1.mobile} />
          <Row label="Email" value={s1.email} />
          <Row label="Education" value={s1.education} />

          {/* ✅ Address — object ya string dono handle */}
          {addressDisplay !== null ? (
            <Row label="Address" value={addressDisplay} />
          ) : (
            <>
              <Row label="Dist." value={addr.dist} />
              <Row label="Taluka" value={addr.taluka} />
              <Row label="Village" value={addr.village} />
              <Row label="Pincode" value={addr.pincode} />
            </>
          )}
        </Card>

        {/* Section 2 — Business */}
        <Card title="Business Info" icon="🏢">
          <Row label="Business Name" value={s2.businessName} />
          <Row label="Type" value={s2.businessType} />
          <Row label="Sector" value={s2.sector === "other" ? `Other — ${s2.sectorOther || ""}` : s2.sector} />
          <Row label="Status" value={s2.businessStatus} />
          <Row label="Employment" value={s2.employment} />
          <Row label="Investment" value={s2.investment} />
        </Card>

        {/* Section 3 — Financial */}
        <Card title="Financial Info" icon="💰">
          <Row label="Had Loan" value={s3.hadLoan} />
          <Row label="Loan Type" value={s3.loanType} />
          <Row label="Repayment" value={s3.repaymentStatus} />
          <Row label="CIBIL Score" value={s3.cibilScore} />
          <Row label="Difficulty" value={s3.pastDifficulty} />
        </Card>

        {/* Section 4 — KYC */}
        <Card title="KYC Details" icon="📄">
          <Row label="Aadhaar" value={s4.aadhaar} />
          <Row label="PAN" value={s4.pan} />
          <Row label="Bank" value={s4.bankName} />
          <Row label="Account No" value={s4.accountNo} />
        </Card>
      </div>

      {/* Documents */}
      <div
        style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          marginTop: 20,
        }}
      >
        <h3 style={{ color: C.navy, fontWeight: 700, marginBottom: 16 }}>
          📎 Documents
        </h3>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["aadhaar", "pan", "udyam", "passport"].map((doc) => {
            const fileId = s4.docs?.[doc];
            return (
              <div
                key={doc}
                style={{
                  background: C.light,
                  borderRadius: 10,
                  padding: "16px 20px",
                  minWidth: 140,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {fileId ? "📄" : "❌"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    marginBottom: 8,
                  }}
                >
                  {doc}
                </div>
                {fileId ? (
                  <button
                    onClick={() => openDoc(fileId)}
                    style={{
                      display: "inline-block",
                      padding: "5px 12px",
                      background: C.navy,
                      color: "#fff",
                      borderRadius: 6,
                      fontSize: 12,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    View
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: C.textopa }}>
                    Not uploaded
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Update */}
      <div
        style={{
          background: C.white,
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          marginTop: 20,
        }}
      >
        <h3 style={{ color: C.navy, fontWeight: 700, marginBottom: 16 }}>
          ⚙️ Update Status
        </h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label
              style={{
                fontSize: 13,
                color: C.textopa,
                display: "block",
                marginBottom: 6,
              }}
            >
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                padding: "10px 14px",
                border: "1.5px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                background: C.white,
                minWidth: 180,
              }}
            >
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label
              style={{
                fontSize: 13,
                color: C.textopa,
                display: "block",
                marginBottom: 6,
              }}
            >
              Remark (optional)
            </label>
            <input
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Admin remark..."
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #ddd",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={saving}
            style={{
              padding: "10px 24px",
              background: C.maroon,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <h3
        style={{
          color: C.navy,
          fontWeight: 700,
          marginBottom: 14,
          fontSize: 15,
        }}
      >
        {icon} {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
      <span style={{ color: C.textopa, minWidth: 100 }}>{label}:</span>
      <span style={{ fontWeight: 600, color: C.black }}>{value || "—"}</span>
    </div>
  );
}
