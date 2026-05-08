import { useState } from "react";
import { useLang } from "../context/LangContext";

// icons
import Journey from "../assets/journey.svg";
import Assessment from "../assets/Assessment.svg";
import Vikas from "../assets/Vikas.svg";
import Hub from "../assets/Hub.svg";
import Schemes from "../assets/Schemes.svg";
import Profile from "../assets/Profile.svg";
import Applications from "../assets/Applications.svg";
import Library from "../assets/Library.svg";
import Universities from "../assets/Universities.svg";
import Partners from "../assets/Partners.svg";
import About from "../assets/About.svg";

// Logo
import gulogo from "../assets/gulogotransparent.png";
import guicon from "../assets/guicon.svg";
import C from "../constants/colors";

const NAV = {
  MY_JOURNEY: [
    {
      key: "my_journey",
      label: "My Journey (5 Steps)",
      labelMr: "माझा प्रवास (5 टप्पे)",
      icon: <img src={Journey} />,
    },
    {
      key: "my_assessment",
      label: "My Assessment",
      labelMr: "माझे मूल्यांकन",
      icon: <img src={Assessment} />,
    },
    {
      key: "udyog_vikas",
      label: "Udyog Vikas Kendra",
      labelMr: "उद्योग विकास केंद्र",
      icon: <img src={Vikas} />,
    },
    {
      key: "schemes_hub",
      label: "Schemes Hub",
      labelMr: "योजना हब",
      icon: <img src={Hub} />,
    },
  ],
  USER: [
    {
      key: "profile",
      label: "Profile",
      labelMr: "प्रोफाइल",
      icon: <img src={Profile} />,
    },
    {
      key: "my_applications",
      label: "My Applications",
      labelMr: "माझे अर्ज",
      icon: <img src={Applications} />,
    },
  ],
  MARKET_HUB: [
    {
      key: "dpr_library",
      label: "DPR Library",
      labelMr: "DPR लायब्ररी",
      icon: <img src={Library} />,
    },
    {
      key: "govt_schemes",
      label: "Govt Schemes",
      labelMr: "शासकीय योजना",
      icon: <img src={Schemes} />,
    },
    {
      key: "universities",
      label: "Universities",
      labelMr: "विद्यापीठे",
      icon: <img src={Universities} />,
    },
    {
      key: "ecosystem",
      label: "Ecosystem Partners",
      labelMr: "इकोसिस्टम भागीदार",
      icon: <img src={Partners} />,
    },
    {
      key: "about_us",
      label: "About Us",
      labelMr: "आमच्याबद्दल",
      icon: <img src={About} />,
    },
  ],
};

const EXPANDED_W = 260;
const COLLAPSED_W = 68;

function NavItem({ item, active, onClick, lang, expanded }) {
  const label = lang === "mr" ? item.labelMr : item.label;
  return (
    <div
      title={!expanded ? label : ""}
      onClick={() => onClick(item.key)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: expanded ? 14 : 0,
        justifyContent: expanded ? "flex-start" : "center",
        padding: expanded ? "12px 16px" : "12px 0",
        borderRadius: 10,
        cursor: "pointer",
        background: active ? C.active : "transparent",
        color: active ? C.white : C.text,
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        marginBottom: 2,
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontSize: 18,
          minWidth: 24,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      {expanded && (
        <span
          style={{
            opacity: 1,
            transition: "opacity 0.2s ease",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function SectionLabel({ label, expanded }) {
  if (!expanded)
    return (
      <div style={{ height: 1, background: C.border, margin: "12px 8px" }} />
    );
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#5a7aa8",
        letterSpacing: 1.2,
        margin: "18px 16px 6px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </p>
  );
}

// ✅ onLogout prop add kiya
function Sidebar({ activeKey, onNav, onLogout }) {
  const { lang, setLang } = useLang();
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: expanded ? EXPANDED_W : COLLAPSED_W,
          minWidth: expanded ? EXPANDED_W : COLLAPSED_W,
          background: C.navy,
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: expanded ? "40px 12px" : "40px 6px",
          boxSizing: "border-box",
          transition:
            "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1), padding 0.3s ease",
          scrollbarWidth: "none",
          display: "flex",
          flexDirection: "column",
        }}
        className="sidebar"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setExpanded((p) => !p)}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            position: "fixed",
            top: "20px",
            left: expanded ? EXPANDED_W - 15 : COLLAPSED_W - 15,
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: `2px solid ${C.navyDark}`,
            background: C.orange,
            color: C.white,
            cursor: "pointer",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
            zIndex: 99999,
            transition: "left 0.3s ease",
            transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
            marginLeft: 4,
          }}
        >
          ❮
        </button>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: expanded ? "flex-start" : "center",
            marginBottom: 16,
            padding: expanded ? "0 4px" : 0,
            paddingRight: expanded ? 24 : 0,
          }}
        >
          {!expanded && (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img style={{ width: 60 }} src={guicon} alt="" />
            </div>
          )}
          {expanded && (
            <div style={{ marginLeft: 10, overflow: "hidden" }}>
              <img style={{ width: "200px" }} src={gulogo} />
            </div>
          )}
        </div>

        {/* Entrepreneur Badge */}
        {expanded ? (
          <div
            style={{
              background: C.orange,
              color: "#fff",
              textAlign: "center",
              borderRadius: 8,
              padding: "8px 0",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 20,
              whiteSpace: "nowrap",
            }}
          >
            Entrepreneur
          </div>
        ) : (
          <div style={{ height: 8 }} />
        )}

        {/* MY JOURNEY */}
        <SectionLabel label="My Journey" expanded={expanded} />
        {NAV.MY_JOURNEY.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={activeKey === item.key}
            onClick={onNav}
            lang={lang}
            expanded={expanded}
          />
        ))}

        {/* USER */}
        <div style={{ borderTop: `1px solid ${C.border}`, margin: "12px 0" }} />
        {NAV.USER.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={activeKey === item.key}
            onClick={onNav}
            lang={lang}
            expanded={expanded}
          />
        ))}

        {/* MARKET HUB */}
        <SectionLabel label="Market Hub" expanded={expanded} />
        {NAV.MARKET_HUB.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={activeKey === item.key}
            onClick={onNav}
            lang={lang}
            expanded={expanded}
          />
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Language Toggle */}
        {expanded ? (
          <div
            style={{
              display: "flex",
              background: C.navyDark,
              borderRadius: 12,
              padding: 4,
              margin: "12px 0",
            }}
          >
            {["en", "mr"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: lang === l ? C.orange : "transparent",
                  color: lang === l ? "#fff" : C.text,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {l === "en" ? "EN" : "मराठी"}
              </button>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              margin: "12px 0",
            }}
          >
            {["en", "mr"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                title={l === "en" ? "English" : "मराठी"}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "none",
                  background: lang === l ? C.orange : C.active,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {l === "en" ? "EN" : "मर"}
              </button>
            ))}
          </div>
        )}

        {/* ✅ Sign Out — onLogout connected */}
        <div
          onClick={onLogout}
          title="Sign Out"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: expanded ? "flex-start" : "center",
            gap: expanded ? 10 : 0,
            color: C.text,
            cursor: "pointer",
            padding: "10px 8px",
            fontSize: 14,
            borderRadius: 8,
            transition: "all 0.2s",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>↪</span>
          {expanded && <span>Sign Out</span>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
