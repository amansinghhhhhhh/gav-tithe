import { useEffect, useState } from "react";
import { getEditRequests, updateEditRequest } from "../services/api";
import C from "../constants/colors";
import { Spinner } from "../components/shared/Spinner";

const STATUS_COLORS = {
  pending: { bg: "#fff7ed", fg: "#c2410c", border: "#fdba74" },
  approved: { bg: "#dcfce7", fg: "#166534", border: "#86efac" },
  rejected: { bg: "#fee2e2", fg: "#991b1b", border: "#fca5a5" },
  resolved: { bg: "#e0f2fe", fg: "#075985", border: "#7dd3fc" },
};

export default function EditRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    getEditRequests().then((res) => {
      if (res.success) setRequests(res.requests);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleAction = async (id, status) => {
    const remark = window.prompt(
      status === "approved"
        ? "Remark (optional):"
        : "Rejection reason (optional):"
    );
    if (remark === null) return;
    const res = await updateEditRequest(id, status, remark || "");
    if (res.success) {
      setMsg(`✅ Request ${status}!`);
      load();
    } else {
      setMsg("❌ " + (res.message || "Update failed"));
    }
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div style={{ padding: "28px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ color: C.navy, fontWeight: 800, margin: 0 }}>
            ✏️ Edit Requests
          </h2>
          <p style={{ margin: "4px 0 0", color: C.textopa, fontSize: 13 }}>
            Users who want to edit their submitted form
          </p>
        </div>
        <button
          onClick={load}
          style={{
            padding: "8px 16px",
            background: C.white,
            border: "1.5px solid #ddd",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Refresh
        </button>
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
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: 60,
          }}
        >
          <Spinner size={48} />
          <div style={{ color: C.maroon, fontWeight: 600 }}>Loading...</div>
        </div>
      ) : requests.length === 0 ? (
        <div
          style={{
            background: C.white,
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
            color: C.textopa,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <div style={{ fontWeight: 600 }}>No edit requests yet</div>
        </div>
      ) : (
        <div
          style={{
            background: C.white,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.textopa, borderBottom: "1px solid #eee" }}>
                <th style={{ padding: "14px 16px" }}>User</th>
                <th style={{ padding: "14px 16px" }}>Mobile</th>
                <th style={{ padding: "14px 16px" }}>Message</th>
                <th style={{ padding: "14px 16px" }}>Requested On</th>
                <th style={{ padding: "14px 16px" }}>Status</th>
                <th style={{ padding: "14px 16px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
                return (
                  <tr key={r._id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: C.navy }}>
                      {r.user?.name || "—"}
                      <div style={{ fontSize: 11, color: C.textopa, fontWeight: 400 }}>
                        {r.user?.email || ""}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>{r.user?.mobile || "—"}</td>
                    <td style={{ padding: "14px 16px", maxWidth: 280 }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        title={r.message}
                      >
                        {r.message}
                      </div>
                      {r.remark && (
                        <div style={{ fontSize: 11, color: C.textopa, marginTop: 4 }}>
                          Remark: {r.remark}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          background: sc.bg,
                          color: sc.fg,
                          border: `1px solid ${sc.border}`,
                          borderRadius: 20,
                          padding: "3px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {r.status === "pending" ? (
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) handleAction(r._id, e.target.value);
                            e.target.value = "";
                          }}
                          style={{
                            padding: "7px 10px",
                            border: "1.5px solid #ddd",
                            borderRadius: 8,
                            fontSize: 13,
                            outline: "none",
                            background: C.white,
                            cursor: "pointer",
                          }}
                        >
                          <option value="" disabled>
                            Select...
                          </option>
                          <option value="approved">✅ Approve</option>
                          <option value="rejected">❌ Reject</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: 12, color: C.textopa }}>
                          {r.status === "approved" ? "User can edit now" : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
