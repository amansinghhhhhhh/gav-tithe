import { useRef, useState } from "react";
import { useLang } from "../../context/LangContext";
import { Spinner } from "./Spinner";
import C from "../../constants/colors";

const FILE_MAX = 5 * 1024 * 1024;   // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function DocUploadBox({ label, sublabel, uploaded, loading = false, onUpload, onRemove, error }) {
  const { t } = useLang();
  const inputRef = useRef(null);
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErr(t("s4_doc_type_err") || "Only PDF, JPG, PNG, WEBP are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > FILE_MAX) {
      setErr(t("s4_doc_size_err") || "File must be under 5MB");
      e.target.value = "";
      return;
    }

    setErr("");
    onUpload(file);
  };

  const showSpinner = loading && !uploaded;

  return (
    <div style={{ flex: 1, minWidth: 110, position: "relative" }}>
      {uploaded && !loading && onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={onRemove}
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            zIndex: 2,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#dc2626",
            color: "#fff",
            border: "2px solid #fff",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          }}
        >
          ✕
        </button>
      )}
      <label
        style={{
          border: `2px dashed ${err ? "#e53e3e" : uploaded ? C.green : "#bbb"}`,
          borderRadius: 10,
          padding: "18px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: loading ? "wait" : "pointer",
          background: uploaded ? "#f0fff4" : loading ? "#fffdf5" : "#fafafa",
          textAlign: "center",
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.9 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          style={{ display: "none" }}
          onChange={handleChange}
          disabled={loading}
        />

        <span style={{ fontSize: 22, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 26 }}>
          {showSpinner ? (
            <Spinner size={20} />
          ) : uploaded ? (
            "✅"
          ) : (
            "☁️"
          )}
        </span>

        <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>
          {showSpinner ? t("s4_uploading") : label}
        </span>

        {sublabel && !showSpinner && (
          <span style={{ fontSize: 10, color: "#888", marginTop: 3 }}>
            {sublabel}
          </span>
        )}

        {!showSpinner && (
          <span style={{ fontSize: 9, color: "#aaa", marginTop: 4 }}>
            ≤5MB
          </span>
        )}
      </label>

      {(err || error) && (
        <span style={{ fontSize: 10, color: "#e53e3e", display: "block", textAlign: "center", marginTop: 4 }}>
          ⚠ {err || error}
        </span>
      )}
    </div>
  );
}

export default DocUploadBox;
