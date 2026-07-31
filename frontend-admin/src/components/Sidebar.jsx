import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import C from "../constants/colors";
// Logo
import gulogo from "../assets/gulogotransparent.png";
import guicon from "../assets/guicon.svg";
import dashboard from "../assets/dashboard.svg";
import userList from "../assets/userList.svg";
import editRequest from "../assets/editRequest.svg";
const NAV = [
  {
    key: "/dashboard",
    label: "Dashboard",
    icon: <img src={dashboard} />,
  },
  {
    key: "/users",
    label: "Users List",
    icon: <img src={userList} />,
  },
  {
    key: "/edit-requests",
    label: "Edit Requests",
    icon: <img src={editRequest} />,
  },
];

const EXPANDED_W = 240;
const COLLAPSED_W = 70;

function NavItem({ item, active, expanded, onClick }) {
  return (
    <div
      title={!expanded ? item.label : ""}
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
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.label}
        </span>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      >
        {/* Toggle Button */}
        <button
          onClick={() => setExpanded((p) => !p)}
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
              <img style={{ width: "180px" }} src={gulogo} />
            </div>
          )}
        </div>

        {/* Badge */}
        {expanded && (
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
            Administrator
          </div>
        )}

        {/* Navigation */}
        <div style={{ flex: 1 }}>
          {NAV.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              expanded={expanded}
              active={location.pathname === item.key}
              onClick={(path) => navigate(path)}
            />
          ))}
        </div>

        {/* Logout */}
        <div
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: expanded ? "flex-start" : "center",
            gap: expanded ? 12 : 0,
            padding: "12px 14px",
            borderRadius: 10,
            cursor: "pointer",
            color: "rgba(255,255,255,0.8)",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: 18 }}>↪</span>

          {expanded && (
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Logout
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
