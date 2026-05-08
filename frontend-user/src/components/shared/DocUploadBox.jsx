import C from "../../constants/colors";

function DocUploadBox({ label, sublabel, uploaded, onUpload }) {
  return (
    <label
      style={{
        border: `2px dashed ${uploaded ? C.green : "#bbb"}`,
        borderRadius: 10,
        padding: "18px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        background: uploaded ? "#f0fff4" : "#fafafa",
        flex: 1,
        minWidth: 110,
        textAlign: "center",
      }}
    >
      <input
        type="file"
        accept=".pdf,image/*"
        style={{ display: "none" }}
        onChange={(e) => onUpload(e.target.files[0])}
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
    </label>
  );
}

export default DocUploadBox;
