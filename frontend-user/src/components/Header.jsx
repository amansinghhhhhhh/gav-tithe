import { useState } from "react";
import C from "../constants/colors";
import { useLang } from "../context/LangContext";
import maccialogo from "../assets/MACCIAlogo.svg";
import gulogo from "../assets/gulogo.svg";
import loginicon from "../assets/loginicon.svg";

function useIsMobile() {
  const [isMobile] = useState(window.innerWidth < 768);
  return isMobile;
}

export function Header() {
  const { lang, setLang, t } = useLang();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const navKeys = [
    "nav_home",
    "nav_schemes",
    "nav_about",
    "nav_ecosystem",
    "nav_register",
  ];

  return (
    <>
      <header
        style={{
          background: C.maroon,
          padding: isMobile ? "0 16px" : "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: isMobile ? 60 : 80,
          position: "sticky",
          top: 0,
          zIndex: 999,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        {/* Logos */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 8 : 16,
          }}
        >
          <a href="https://gaontitheudyojak.com/">
            <img
              src={maccialogo}
              style={{ height: isMobile ? 32 : 44 }}
              alt="MACCIA"
            />
          </a>
          <a href="https://gaontitheudyojak.com/">
            <img src={gulogo} style={{ height: isMobile ? 32 : 44 }} alt="GU" />
          </a>
        </div>

        {/* Desktop Nav */}
        {/* {!isMobile && (
          <nav style={{ display: "flex", gap: 20 }}>
            {navKeys.map((key) => (
              <a
                key={key}
                href="#"
                style={{ color: "#fff", textDecoration: "none", fontSize: 13 }}
              >
                {t(key)}
              </a>
            ))}
          </nav>
        )} */}

        {/* Right Section */}
        <div
          style={{
            display: "flex",
            gap: isMobile ? 8 : 10,
            alignItems: "center",
          }}
        >
          {/* Language Toggle */}
          <div
            style={{
              display: "flex",
              border: "0.1px solid #fff",
              borderRadius: 10,
              padding: "3px",
              background: "#00800780",
            }}
          >
            <button
              onClick={() => setLang("en")}
              style={{
                padding: isMobile ? "4px 8px" : "5px 12px",
                background: lang === "en" ? "#fff" : "transparent",
                color: lang === "en" ? C.maroon : "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: isMobile ? 12 : 14,
                borderRadius: 8,
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang("mr")}
              style={{
                padding: isMobile ? "4px 8px" : "5px 12px",
                background: lang === "mr" ? "#fff" : "transparent",
                color: lang === "mr" ? C.maroon : "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: isMobile ? 12 : 14,
                borderRadius: 8,
              }}
            >
              मराठी
            </button>
          </div>

          {/* Login Button — desktop only */}
          {/* {!isMobile && (
            <button
              style={{
                background: "transparent",
                color: "#fff",
                border: "0.1px solid #fff",
                borderRadius: 10,
                padding: "8px 16px",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <img src={loginicon} style={{ height: 18 }} alt="" />
              Login
            </button>
          )} */}

          {/* Hamburger — mobile only */}
          {/* {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontSize: 22,
                padding: "4px",
              }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )} */}
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      {/* {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            background: C.maroon,
            zIndex: 998,
            padding: "12px 16px 20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navKeys.map((key) => (
            <a
              key={key}
              href="#"
              onClick={() => setMenuOpen(false)}
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: 15,
                padding: "10px 12px",
                borderRadius: 8,
                display: "block",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {t(key)}
            </a>
          ))}

          <button
            style={{
              marginTop: 8,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <img src={loginicon} style={{ height: 16 }} alt="" />
            Login
          </button>
        </div>
      )} */}
    </>
  );
}
