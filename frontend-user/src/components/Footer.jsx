import { useState } from "react";
import { useLang } from "../context/LangContext";
import C from "../constants/colors";
import maccialogo from "../assets/MACCIAlogo.svg";
import gulogo from "../assets/gulogo.svg";

function useIsMobile() {
  const [isMobile] = useState(window.innerWidth < 768);
  return isMobile;
}

export function Footer() {
  const { t } = useLang();
  const isMobile = useIsMobile();

  return (
    <footer
      style={{
        background: C.navy,
        color: "#fff",
        padding: isMobile ? "24px 16px 16px" : "36px 40px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: isMobile ? 24 : 40,
          flexWrap: "wrap",
          marginBottom: 24,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Brand */}
        <div style={{ flex: 2 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <img
              src={maccialogo}
              style={{ height: isMobile ? 32 : 40 }}
              alt="MACCIA"
            />
            <img src={gulogo} style={{ height: isMobile ? 32 : 40 }} alt="GU" />
          </div>
          <p
            style={{ fontSize: 12, color: "#aac", lineHeight: 1.7, margin: 0 }}
          >
            {t("f_tagline")}
          </p>
        </div>

        {/* Links + Contact */}
        <div
          style={{
            display: "flex",
            gap: isMobile ? 16 : 40,
            flex: 3,
            flexWrap: "wrap",
          }}
        >
          {/* Links */}
          <div style={{ flex: 1, minWidth: 120 }}>
            <h4 style={{ color: "#fff", margin: "0 0 10px", fontSize: 14 }}>
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
                    display: "block",
                  }}
                >
                  {t(key)}
                </a>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ flex: 2, minWidth: 200 }}>
            <h4 style={{ color: "#fff", margin: "0 0 10px", fontSize: 14 }}>
              {t("f_contact")}
            </h4>
            <p
              style={{
                fontSize: 12,
                color: "#aac",
                lineHeight: 1.7,
                margin: "0 0 6px",
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
      </div>

      {/* Copyright */}
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
