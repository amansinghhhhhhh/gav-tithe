import { inputStyle, labelStyle } from "./styles";

// Reusable input with red border + error text
export function ValidatedInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  maxLength,
  disabled,
  prefix,
  suffix,
  children, // for custom input slots (e.g. OTP row)
}) {
  const hasError = !!error;

  const borderStyle = {
    ...inputStyle,
    border: `1.5px solid ${hasError ? "#e53e3e" : "#ddd"}`,
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={labelStyle}>{label}</label>}

      {children ? (
        // Custom slot (e.g. mobile+OTP row)
        <div
          style={{
            border: hasError ? "1.5px solid #e53e3e" : "none",
            borderRadius: 8,
          }}
        >
          {children}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {prefix && (
            <div
              style={{
                ...inputStyle,
                width: 52,
                flexShrink: 0,
                background: "#f5f5f5",
                color: "#555",
                textAlign: "center",
              }}
            >
              {prefix}
            </div>
          )}
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            disabled={disabled}
            style={{ ...borderStyle, flex: 1 }}
          />
          {suffix}
        </div>
      )}

      {hasError && (
        <span style={{ fontSize: 11, color: "#e53e3e", marginTop: 2 }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

// Reusable textarea with validation
export function ValidatedTextarea({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  minHeight = 70,
}) {
  const hasError = !!error;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          ...inputStyle,
          minHeight,
          resize: "vertical",
          border: `1.5px solid ${hasError ? "#e53e3e" : "#ddd"}`,
        }}
      />
      {hasError && (
        <span style={{ fontSize: 11, color: "#e53e3e", marginTop: 2 }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

// Reusable select with validation
export function ValidatedSelect({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  error,
  sublabel,
}) {
  const hasError = !!error;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={labelStyle}>{label}</label>}
      {sublabel && (
        <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px" }}>
          {sublabel}
        </p>
      )}
      <select
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          ...inputStyle,
          appearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: 32,
          border: `1.5px solid ${hasError ? "#e53e3e" : "#ddd"}`,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span style={{ fontSize: 11, color: "#e53e3e", marginTop: 2 }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
