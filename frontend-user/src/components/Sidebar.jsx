import { useState, useEffect } from "react";
import { useLang } from "../context/LangContext";

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
const COLLAPSED_W = 75;

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
        marginBottom: 4,
        transition: "all 0.2s ease",
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
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
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
      <div style={{ height: 1, background: C.border, margin: "15px 10px" }} />
    );
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#5a7aa8",
        letterSpacing: 1.2,
        margin: "20px 16px 8px",
        textTransform: "uppercase",
      }}
    >
      {label}
    </p>
  );
}

function Sidebar({ activeKey, onNav, onLogout }) {
  const { lang, setLang } = useLang();
  const [expanded, setExpanded] = useState(window.innerWidth >= 1200);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1200;
      setIsMobile(mobile);
      if (mobile) setExpanded(false);
      else setExpanded(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = expanded ? EXPANDED_W : isMobile ? 0 : COLLAPSED_W;

  return (
    <>
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "60px",
            background: C.navy,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Pushes content to left and right
            padding: "0 15px", // Adjusted padding for sides
            zIndex: 99997,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          {/* Toggle Button on the Left */}
          <button
            onClick={() => setExpanded(true)}
            style={{
              background: C.orange,
              border: "none",
              color: "#fff",
              fontSize: "20px",
              padding: "5px 12px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>

          {/* Large Image on the Right */}
          <img
            src={gulogo}
            style={{ height: "35px", width: "auto" }}
            alt="logo"
          />
        </div>
      )}

      {isMobile && expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 99998,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 99999,
          width: sidebarWidth,
          height: "100vh",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          background: C.navy,
        }}
      >
        {!isMobile && (
          <button
            onClick={() => setExpanded((p) => !p)}
            style={{
              position: "absolute",
              top: "45px",
              right: "-14px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: `2px solid ${C.navyDark}`,
              background: C.orange,
              color: C.white,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              zIndex: 100001,
              transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s ease",
            }}
          >
            ❮
          </button>
        )}

        <div
          style={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            padding: expanded ? "30px 15px" : isMobile ? "0" : "30px 8px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            transform:
              isMobile && !expanded ? "translateX(-100%)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: expanded ? "flex-start" : "center",
              marginBottom: 25,
            }}
          >
            {expanded ? (
              <img style={{ width: "180px" }} src={gulogo} />
            ) : (
              !isMobile && <img style={{ width: 45 }} src={guicon} />
            )}
          </div>

          {expanded && (
            <div
              style={{
                background: C.orange,
                color: "#fff",
                textAlign: "center",
                borderRadius: 8,
                padding: "10px",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              ENTREPRENEUR
            </div>
          )}

          <SectionLabel label="My Journey" expanded={expanded} />
          {NAV.MY_JOURNEY.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
              onClick={(k) => {
                onNav(k);
                if (isMobile) setExpanded(false);
              }}
              lang={lang}
              expanded={expanded}
            />
          ))}

          <div
            style={{ borderTop: `1px solid ${C.border}`, margin: "15px 0" }}
          />
          {NAV.USER.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
              onClick={(k) => {
                onNav(k);
                if (isMobile) setExpanded(false);
              }}
              lang={lang}
              expanded={expanded}
            />
          ))}

          <SectionLabel label="Market Hub" expanded={expanded} />
          {NAV.MARKET_HUB.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
              onClick={(k) => {
                onNav(k);
                if (isMobile) setExpanded(false);
              }}
              lang={lang}
              expanded={expanded}
            />
          ))}

          <div style={{ flex: 1, minHeight: "40px" }} />

          <div
            style={{
              display: "flex",
              flexDirection: expanded ? "row" : "column",
              background: expanded ? C.navyDark : "transparent",
              borderRadius: 12,
              padding: expanded ? 4 : 0,
              marginBottom: 15,
              gap: 4,
            }}
          >
            {["en", "mr"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: expanded ? 10 : 8,
                  border: "none",
                  background:
                    lang === l ? C.orange : expanded ? "transparent" : C.active,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {l === "en" ? "EN" : expanded ? "मराठी" : "मर"}
              </button>
            ))}
          </div>

          <div
            onClick={onLogout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: expanded ? "flex-start" : "center",
              gap: 12,
              color: C.text,
              cursor: "pointer",
              padding: "12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontSize: 18 }}>↪</span>
            {expanded && <span>Sign Out</span>}
          </div>
        </div>
      </div>

      {!isMobile && (
        <div
          style={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: "width 0.3s ease",
          }}
        />
      )}
    </>
  );
}

export default Sidebar;
