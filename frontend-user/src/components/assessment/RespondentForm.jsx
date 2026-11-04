import { useState } from "react";
import C from "../../constants/colors";
import { User, Phone, MapPin } from "lucide-react";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  fontSize: 14,
  color: "#374151",
  border: "1.5px solid #d1d5db",
  borderRadius: 10,
  outline: "none",
  fontFamily: "inherit",
  background: "#f9fafb",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: C.navy,
  marginBottom: 6,
};

export default function RespondentForm({ user, initial, onSave, saving, lang, serverError }) {
  const normalize = (v) => {
    const digits = String(v || "").replace(/\D/g, "");
    return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  };

  const [whatsapp, setWhatsapp] = useState(
    normalize(initial?.whatsapp) || normalize(user?.mobile) || ""
  );
  const [village, setVillage] = useState(initial?.village || "");
  const [taluka, setTaluka] = useState(initial?.taluka || "");
  const [district, setDistrict] = useState(initial?.district || "");
  const [age18, setAge18] = useState(!!initial?.age18);
  const [consent, setConsent] = useState(!!initial?.consent);
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!/^[6-9]\d{9}$/.test(normalize(whatsapp))) {
      setError(
        lang === "mr"
          ? "कृपया वैध १० अंकी व्हॉट्सअॅप क्रमांक टाका."
          : "Please enter a valid 10-digit WhatsApp number."
      );
      return;
    }
    if (!village.trim()) {
      setError(lang === "mr" ? "कृपया गावाचं नाव टाका." : "Please enter your village.");
      return;
    }
    if (!taluka.trim()) {
      setError(lang === "mr" ? "कृपया तालुका टाका." : "Please enter your taluka.");
      return;
    }
    if (!district.trim()) {
      setError(lang === "mr" ? "कृपया जिल्हा टाका." : "Please enter your district.");
      return;
    }
    if (!age18) {
      setError(
        lang === "mr"
          ? "१८ वर्षं किंवा त्यापेक्षा जास्त वयाची पुष्टी करा."
          : "Please confirm that you are 18 years or older."
      );
      return;
    }
    if (!consent) {
      setError(
        lang === "mr"
          ? "कृपया संमती देण्यासाठी होकार द्या."
          : "Please give your consent to continue."
      );
      return;
    }
    onSave({
      whatsapp: normalize(whatsapp),
      village: village.trim(),
      taluka: taluka.trim(),
      district: district.trim(),
      age18: true,
      consent: true,
    });
  };

  const checkboxRow = (checked, onChange, text) => (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        background: checked ? "#f0f9ff" : "#f9fafb",
        border: checked ? `2px solid ${C.navy}` : "2px solid #e5e7eb",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 13,
        color: "#374151",
        lineHeight: 1.5,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18, marginTop: 1, accentColor: C.navy, flexShrink: 0 }}
      />
      <span>{text}</span>
    </label>
  );

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a6e 100%)`,
            padding: "28px",
          }}
        >
          <h2 style={{ color: "#fff", margin: 0, fontSize: 21, fontWeight: 800 }}>
            {lang === "mr" ? "तुमची माहिती" : "Your Details"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", margin: "6px 0 0", fontSize: 13 }}>
            {lang === "mr"
              ? "प्रश्न सुरू करण्यापूर्वी ही माहिती भरा."
              : "Fill this in before starting the questions."}
          </p>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 18,
              fontSize: 13,
              color: C.textopa,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <User size={14} /> {user?.name || "—"}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Phone size={14} /> {user?.mobile || "—"}
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>
              {lang === "mr" ? "व्हॉट्सअॅप क्रमांक *" : "WhatsApp Number *"}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit number"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ flex: "1 1 180px" }}>
              <label style={labelStyle}>{lang === "mr" ? "गाव *" : "Village *"}</label>
              <input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                maxLength={80}
                placeholder={lang === "mr" ? "गावाचं नाव" : "Village name"}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <label style={labelStyle}>{lang === "mr" ? "तालुका *" : "Taluka *"}</label>
              <input
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                maxLength={80}
                placeholder={lang === "mr" ? "तालुका" : "Taluka"}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} /> {lang === "mr" ? "जिल्हा *" : "District *"}
              </span>
            </label>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              maxLength={80}
              placeholder={lang === "mr" ? "जिल्हा" : "District"}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {checkboxRow(
              age18,
              setAge18,
              lang === "mr"
                ? "माझं वय १८ वर्षं किंवा त्यापेक्षा जास्त आहे."
                : "I am 18 years of age or older."
            )}
            {checkboxRow(
              consent,
              setConsent,
              lang === "mr"
                ? "मी दिलेली माहिती बरोबर आहे. मला मार्गदर्शन आणि सहाय्य देण्यासाठी GTU ने माझ्याशी संपर्क साधावा आणि माझी उत्तरं वापरावीत यास माझी संमती आहे. माझ्या परवानगीशिवाय माझी वैयक्तिक माहिती सार्वजनिकरीत्या वापरली जाणार नाही."
                : "I confirm that the information I give is correct. I allow GTU to contact me and use my answers to guide and support me. My personal details will not be shared publicly without my permission."
            )}
          </div>

          {(error || serverError) && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {error || serverError}
            </div>
          )}

          <button
            onClick={submit}
            disabled={saving}
            style={{
              width: "100%",
              padding: "14px 0",
              background: saving
                ? "#e5e7eb"
                : `linear-gradient(135deg, ${C.orange}, #fb923c)`,
              color: saving ? "#9ca3af" : "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 4px 14px rgba(249,115,22,0.35)",
            }}
          >
            {saving
              ? lang === "mr"
                ? "जतन होत आहे..."
                : "Saving..."
              : lang === "mr"
              ? "मूल्यांकन सुरू करा"
              : "Start Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
