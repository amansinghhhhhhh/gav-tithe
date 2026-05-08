import C from "../constants/colors";
import { useLang } from "../context/LangContext";
import maccialogo from "../assets/MACCIAlogo.svg";
import gulogo from "../assets/gulogo.svg";
import loginicon from "../assets/loginicon.svg";

export function Header({}) {
  const { lang, setLang, t } = useLang();
  return (
    <header
      style={{
        background: C.maroon,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 80,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{}}>
          <img src={maccialogo} />
        </div>
        <div style={{}}>
          <img src={gulogo} />
        </div>
      </div>
      <nav style={{ display: "flex", gap: 20, marginLeft: 20 }}>
        <a
          href="#"
          style={{ color: "#fff", textDecoration: "none", fontSize: 13 }}
        >
          {t("nav_home")}
        </a>
        <a
          href="#"
          style={{ color: "#fff", textDecoration: "none", fontSize: 13 }}
        >
          {t("nav_schemes")}
        </a>
        <a
          href="#"
          style={{ color: "#fff", textDecoration: "none", fontSize: 13 }}
        >
          {t("nav_about")}
        </a>
        <a
          href="#"
          style={{ color: "#fff", textDecoration: "none", fontSize: 13 }}
        >
          {t("nav_ecosystem")}
        </a>
        <a
          href="#"
          style={{ color: "#fff", textDecoration: "none", fontSize: 13 }}
        >
          {t("nav_register")}
        </a>
      </nav>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            border: "0.1px solid #fff",
            borderRadius: 10,
            overflow: "hidden",
            padding: "4px",
            background: "#00800780",
            width: "177px",
          }}
        >
          <button
            onClick={() => setLang("en")}
            style={{
              padding: "5px 12px",
              background: lang === "en" ? "#fff" : "transparent",
              color: lang === "en" ? C.engcolor : "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 24,
              borderRadius: 10,
              width: 80,
            }}
          >
            EN
          </button>
          <button
            onClick={() => setLang("mr")}
            style={{
              padding: "5px 12px",
              background: lang === "mr" ? "#fff" : "transparent",
              color: lang === "mr" ? C.maroon : "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 12,
              fontSize: 24,
              borderRadius: 10,
            }}
          >
            मराठी
          </button>
        </div>
        <button
          style={{
            background: C.color1,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            border: "0.1px solid #fff",
            padding: "10px 16px",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: 24,
            width: "177px",
            display: "flex",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <img src={loginicon} /> login
        </button>
      </div>
    </header>
  );
}
