import C from "../../constants/colors";

export default function QuestionStep({ question, step, selectedOptions, onSelect, lang }) {
  const handleToggle = (key) => {
    const isSelected = selectedOptions.includes(key);
    const newOptions = isSelected
      ? selectedOptions.filter((k) => k !== key)
      : [...selectedOptions, key];
    onSelect(newOptions);
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Question Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a6e 100%)`,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              background: C.orange,
              color: "#fff",
              borderRadius: 8,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Q{step}/15
          </span>
        </div>
        <h3
          style={{
            color: "#fff",
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {lang === "mr" ? question.mr : question.en}
        </h3>
        {lang === "mr" && (
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              margin: "6px 0 0",
              fontSize: 13,
            }}
          >
            {question.en}
          </p>
        )}
      </div>

      {/* Options */}
      <div style={{ padding: "20px 24px" }}>
        <p
          style={{
            fontSize: 13,
            color: C.textopa,
            margin: "0 0 14px",
            fontWeight: 600,
          }}
        >
          {lang === "mr"
            ? "एक किंवा अधिक उत्तरे निवडा:"
            : "Select one or more answers:"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map((opt) => {
            const isSelected = selectedOptions.includes(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => handleToggle(opt.key)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 16px",
                  background: isSelected ? "#f0f9ff" : "#f9fafb",
                  border: isSelected
                    ? `2px solid ${C.navy}`
                    : "2px solid #e5e7eb",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: isSelected
                      ? `2px solid ${C.navy}`
                      : "2px solid #d1d5db",
                    background: isSelected ? C.navy : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    transition: "all 0.2s",
                  }}
                >
                  {isSelected && (
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                      ✓
                    </span>
                  )}
                </div>

                {/* Option Text */}
                <div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.navy,
                      marginRight: 8,
                    }}
                  >
                    {opt.key}.
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {lang === "mr" ? opt.mr : opt.en}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
