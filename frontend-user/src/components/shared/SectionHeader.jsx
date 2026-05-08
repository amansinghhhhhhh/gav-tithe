import C from "../../constants/colors";

function SectionHeader({ title, subtitle, badge, subpara }) {
  return (
    <div
      style={{
        background: C.light,
        borderRadius: "10px 10px 0 0",
        padding: "16px 20px",
        marginBottom: 20,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111" }}>
        {title}
      </h2>

      {subtitle && (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 12,
            color: C.green,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span>✅</span> {subtitle}
        </p>
      )}

      {badge && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#555" }}>
          {badge}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
