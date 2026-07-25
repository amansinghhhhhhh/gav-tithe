import { useState } from "react";
import C from "../../constants/colors";

const FILE_MAX = 5 * 1024 * 1024;   // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function DocUploadBox({ label, sublabel, uploaded, onUpload, error }) {
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErr("फक्त PDF, JPG, PNG, WEBP मान्य आहे");
      e.target.value = "";
      return;
    }

    if (file.size > FILE_MAX) {
      setErr("File जास्तीत जास्त 5MB असावे");
      e.target.value = "";
      return;
    }

    setErr("");
    onUpload(file);
  };

  return (
    <div style={{ flex: 1, minWidth: 110 }}>
      <label
        style={{
          border: `2px dashed ${err ? "#e53e3e" : uploaded ? C.green : "#bbb"}`,
          borderRadius: 10,
          padding: "18px 12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          background: uploaded ? "#f0fff4" : "#fafafa",
          textAlign: "center",
        }}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          style={{ display: "none" }}
          onChange={handleChange}
        />

        <span style={{ fontSize: 22, marginBottom: 6 }}>
          {uploaded ? "✅" : "☁️"}
        </span>

        <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>
          {label}
        </span>

        {sublabel && (
          <span style={{ fontSize: 10, color: "#888", marginTop: 3 }}>
            {sublabel}
          </span>
        )}

        <span style={{ fontSize: 9, color: "#aaa", marginTop: 4 }}>
          ≤5MB
        </span>
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
