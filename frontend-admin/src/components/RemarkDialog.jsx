import { useEffect, useRef, useState } from "react";
import C from "../constants/colors";

export default function RemarkDialog({
  open,
  status = "rejected",
  userName = "",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [remark, setRemark] = useState("");
  const ref = useRef(null);
  const danger = status !== "approved";

  useEffect(() => {
    if (open) {
      setRemark("");
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20,
      }}
    >
      <div
        className="modal-rise"
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "26px 24px 4px" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.navy }}>
            {status === "approved" ? "Approve Request" : "Reject Request"}
          </h3>
          {userName && (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: C.textopa }}>
              User: <span style={{ fontWeight: 600, color: C.navy }}>{userName}</span>
            </p>
          )}
          <label
            style={{
              display: "block",
              margin: "16px 0 6px",
              fontSize: 13,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            {status === "approved" ? "Remark (optional)" : "Rejection reason (optional)"}
          </label>
          <textarea
            ref={ref}
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={
              status === "approved"
                ? "Add a remark for this approval..."
                : "Why is this request being rejected?..."
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "vertical",
              padding: "10px 12px",
              border: "1.5px solid #cbd5e1",
              borderRadius: 10,
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
              color: C.navy,
            }}
            onFocus={(e) => (e.target.style.borderColor = danger ? "#dc2626" : C.navy)}
            onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
          />
        </div>
        <div style={{ display: "flex", gap: 10, padding: "16px 24px 24px" }}>
          <button
            onClick={() => onCancel?.()}
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: "#fff",
              color: C.textopa,
              border: "1.5px solid #cbd5e1",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm?.(remark.trim())}
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: danger ? "#dc2626" : "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading
              ? "Please wait..."
              : status === "approved"
                ? "Approve"
                : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
