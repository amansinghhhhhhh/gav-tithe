import { useMemo } from "react";
import C from "../../constants/colors";

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function QuestionStep({
  question,
  index,
  total,
  selectedOptions = [],
  textValue = "",
  onSelect,
  onTextChange,
  lang,
  disabled,
}) {
  const isText = question.type === "text";
  const isMulti = question.type === "multi";
  const maxSelect = question.maxSelect || 0;

  // Scenario options (IDs 29-48) are shuffled on display; keys stay original.
  const options = useMemo(() => {
    const isScenario = question.id >= 29 && question.id <= 48;
    return isScenario && question.options ? shuffle(question.options) : question.options || [];
  }, [question.id]);

  const handleToggle = (key) => {
    if (disabled || isText) return;
    if (!isMulti) {
      if (selectedOptions[0] === key) return;
      onSelect([key]);
      return;
    }
    if (selectedOptions.includes(key)) {
      onSelect(selectedOptions.filter((k) => k !== key));
      return;
    }
    if (maxSelect && selectedOptions.length >= maxSelect) return;
    onSelect([...selectedOptions, key]);
  };

  const helper = lang === "mr" ? question.helperMr : question.helperEn;

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
            Q{index}/{total}
          </span>
          {!question.required && (
            <span
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 11,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              {lang === "mr" ? "ऐच्छिक" : "Optional"}
            </span>
          )}
          {isMulti && maxSelect > 0 && (
            <span
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 11,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              {lang === "mr" ? `जास्तीत जास्त ${maxSelect}` : `Up to ${maxSelect}`}
            </span>
          )}
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
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            margin: "6px 0 0",
            fontSize: 13,
          }}
        >
          {lang === "mr" ? question.en : question.mr}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px" }}>
        {helper && (
          <p style={{ margin: "0 0 14px", fontSize: 13, color: C.textopa, fontWeight: 600 }}>
            {helper}
          </p>
        )}

        {isText ? (
          <>
            <textarea
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              onBlur={() => onTextChange(textValue, true)}
              disabled={disabled}
              maxLength={question.maxLength || 300}
              rows={4}
              placeholder={
                lang === "mr"
                  ? "तुमचं उत्तर इथे लिहा..."
                  : "Write your answer here..."
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                fontSize: 14,
                lineHeight: 1.6,
                color: "#374151",
                border: "2px solid #e5e7eb",
                borderRadius: 12,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                background: "#f9fafb",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                fontSize: 12,
                color: (question.maxLength || 300) < textValue.length ? "#dc2626" : C.textopa,
                fontWeight: 600,
              }}
            >
              <span>
                {question.required
                  ? lang === "mr"
                    ? "उत्तर आवश्यक आहे"
                    : "Answer is required"
                  : lang === "mr"
                  ? "ऐच्छिक"
                  : "Optional"}
              </span>
              <span>
                {textValue.length}/{question.maxLength || 300}
              </span>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: 13,
                color: C.textopa,
                margin: "0 0 14px",
                fontWeight: 600,
              }}
            >
              {isMulti
                ? lang === "mr"
                  ? maxSelect > 0
                    ? `जास्तीत जास्त ${maxSelect} पर्याय निवडा:`
                    : "लागू असलेले सर्व पर्याय निवडा:"
                  : maxSelect > 0
                  ? `Select up to ${maxSelect} options:`
                  : "Select all that apply:"
                : lang === "mr"
                ? "सर्वात योग्य उत्तर निवडा:"
                : "Select the best answer:"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {options.map((opt, optIndex) => {
                const isSelected = selectedOptions.includes(opt.key);
                const displayKey = String.fromCharCode(65 + optIndex);
                const atLimit =
                  isMulti && maxSelect > 0 && !isSelected && selectedOptions.length >= maxSelect;
                const isDisabled = disabled || atLimit;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleToggle(opt.key)}
                    disabled={isDisabled}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "14px 16px",
                      background: isSelected ? "#f0f9ff" : "#f9fafb",
                      border: isSelected ? `2px solid ${C.navy}` : "2px solid #e5e7eb",
                      borderRadius: 12,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      opacity: isDisabled ? 0.55 : 1,
                    }}
                  >
                    {/* Radio / Checkbox */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: isMulti ? 6 : "50%",
                        border: isSelected ? `2px solid ${C.navy}` : "2px solid #d1d5db",
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                        transition: "all 0.2s",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: isMulti ? 12 : 10,
                            height: isMulti ? 12 : 10,
                            borderRadius: isMulti ? 3 : "50%",
                            background: C.navy,
                          }}
                        />
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
                        {displayKey}.
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
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        {lang === "mr" ? opt.en : opt.mr}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
