import { useLang } from "../context/LangContext";
import C from "../constants/colors";

import maccialogo from "../assets/MACCIAlogo.svg";
import gulogo from "../assets/gulogo.svg";

export function Footer() {
  const { t } = useLang();

  return (
    <footer
      style={{ background: C.navy, color: "#fff", padding: "36px 40px 16px" }}
    >
      <div
        style={{
          display: "flex",
          gap: 40,
          flexWrap: "wrap",
          marginBottom: 24,
          textAlign: "left",
        }}
      >
        {/* Brand */}
        <div style={{ flex: 2 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{}}>
              <img src={maccialogo} />
            </div>
            <div style={{}}>
              <img src={gulogo} />
            </div>
          </div>
          <p
            style={{ fontSize: 12, color: "#aac", lineHeight: 1.7, margin: 0 }}
          >
            {t("f_tagline")}
          </p>
        </div>

        {/* Links */}
        <div style={{ flex: 1 }}>
          <h4 style={{ color: "#fff", margin: "0 0 14px", fontSize: 14 }}>
            {t("f_links")}
          </h4>
          {["f_l1", "f_l2", "f_l3", "f_l4"].map((key) => (
            <div key={key}>
              <a
                href="#"
                style={{
                  color: "#aac",
                  textDecoration: "none",
                  fontSize: 13,
                  lineHeight: 2,
                }}
              >
                {t(key)}
              </a>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ flex: 2, minWidth: 420 }}>
          <h4 style={{ color: "#fff", margin: "0 0 14px", fontSize: 14 }}>
            {t("f_contact")}
          </h4>
          <p
            style={{
              fontSize: 12,
              color: "#aac",
              lineHeight: 1.7,
              margin: "0 0 8px",
            }}
          >
            📍 {t("f_address")}
          </p>
          <p style={{ fontSize: 12, color: "#aac", margin: "4px 0" }}>
            ✉️ {t("f_email")}
          </p>
          <p style={{ fontSize: 12, color: "#aac", margin: "4px 0" }}>
            📞 {t("f_phone")}
          </p>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #2a4070",
          paddingTop: 14,
          textAlign: "center",
          fontSize: 11,
          color: "#8899bb",
        }}
      >
        {t("f_copy")}
      </div>
    </footer>
  );
}
