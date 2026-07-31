import { useEffect, useState } from "react";
import C from "./constants/colors";
import { useLang } from "./context/LangContext";
import { getEditRequest, getMyForm, createEditRequest } from "./services/api";
import { Spinner } from "./components/shared/Spinner";

export function SuccessPage({ onApproved }) {
  const { t } = useLang();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const loadRequest = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getEditRequest();
      if (res.success) {
        setRequest(res.request);
        if (res.request?.status === "approved" && onApproved) {
          await onApproved();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequest(true);
    setRefreshing(false);
  };

  const activeRequest = request && ["pending", "approved"].includes(request.status);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    const res = await createEditRequest(message.trim());
    setSending(false);
    if (res.success) {
      setRequest(res.request);
      setShowForm(false);
      setMessage("");
      setMsg(t("edit_req_sent"));
    } else {
      setMsg(res.message || "Failed");
    }
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          width: 90,
          height: 90,
          background: C.green,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 44,
          color: "#fff",
        }}
      >
        ✓
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, color: C.green, margin: 0 }}>
        {t("success_msg")}
      </p>

      {msg && (
        <p style={{ fontSize: 13, color: C.maroon, fontWeight: 600, marginTop: 12 }}>
          {msg}
        </p>
      )}

      <div style={{ marginTop: 28, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 12 }}>
            <Spinner size={24} />
          </div>
        ) : activeRequest ? (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fdba74",
              borderRadius: 10,
              padding: "16px 18px",
              fontSize: 13,
              color: "#7c2d12",
              fontWeight: 600,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              {request.status === "approved"
                ? t("edit_req_approved")
                : t("edit_req_pending")}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                margin: "0 auto",
                padding: "8px 18px",
                background: "#fff",
                color: "#7c2d12",
                border: "1.5px solid #fdba74",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 12,
                cursor: refreshing ? "wait" : "pointer",
              }}
            >
              {refreshing && <Spinner size={14} />}
              {refreshing ? t("edit_req_checking") : t("edit_req_refresh")}
            </button>
          </div>
        ) : showForm ? (
          <div
            style={{
              background: C.light,
              borderRadius: 10,
              padding: 18,
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, margin: "0 0 8px" }}>
              {t("edit_req_title")}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("edit_req_placeholder")}
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1.5px solid #ddd",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                onClick={handleSubmit}
                disabled={sending || !message.trim()}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: C.maroon,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: sending ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {sending && <Spinner size={16} style={{ filter: "brightness(0) invert(1)" }} />}
                {sending ? t("edit_req_sending") : t("edit_req_submit")}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 16px",
                  background: "#fff",
                  color: C.text,
                  border: "1.5px solid #ddd",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t("edit_req_cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "12px 28px",
              background: C.navy,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {t("edit_req_button")}
          </button>
        )}
      </div>
    </div>
  );
}
