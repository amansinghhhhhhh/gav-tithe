// ─── RadioGroup.jsx ───────────────────────────────────────────────────────────
import C from "../../constants/colors";

export function RadioGroup({ options, value, onChange, name }) {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={{ accentColor: C.green, width: 16, height: 16 }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
