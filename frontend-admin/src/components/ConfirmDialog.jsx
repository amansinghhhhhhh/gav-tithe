import { useEffect } from "react";
import { TriangleAlert, Trash2, X } from "lucide-react";
import C from "../constants/colors";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  danger = true,
  onConfirm,
  onCancel,
}) {
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
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "26px 24px 8px", textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: danger ? "#fee2e2" : "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <TriangleAlert size={24} color={danger ? "#dc2626" : "#d97706"} strokeWidth={2.3} />
          </div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.navy }}>{title}</h3>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13.5,
              color: C.textopa,
              lineHeight: 1.65,
              whiteSpace: "pre-line",
            }}
          >
            {message}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "20px 24px 24px",
          }}
        >
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
            onClick={() => onConfirm?.()}
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: danger ? "#dc2626" : C.navy,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              "Please wait..."
            ) : (
              <>
                <Trash2 size={15} /> {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
