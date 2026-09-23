import { useEffect, useMemo, useRef, useState } from "react";
import { inputStyle } from "./styles";

const toObj = (o) => (typeof o === "string" ? { value: o, label: o } : o);

export default function SearchSelect({
  value = "",
  onChange,
  onBlur,
  options = [],
  placeholder = "",
  disabled = false,
  error = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const hasError = !!error;
  const selected = value || "";
  const items = useMemo(() => options.map(toObj), [options]);
  const selectedLabel = useMemo(
    () => items.find((o) => o.value === selected)?.label || "",
    [items, selected]
  );

  useEffect(() => {
    setQuery("");
  }, [value, disabled]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
        if (onBlur) onBlur({ target: { value: selected } });
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, selected, onBlur]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((o) => o.label.toLowerCase().includes(q));
  }, [items, query]);

  const display = open ? query : selectedLabel;

  const pick = (opt) => {
    setOpen(false);
    setQuery("");
    if (onChange) onChange({ target: { value: opt.value } });
    if (onBlur) onBlur({ target: { value: opt.value } });
  };

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          style={{
            ...inputStyle,
            border: `1.5px solid ${hasError ? "#e53e3e" : "#ddd"}`,
            cursor: disabled ? "not-allowed" : "text",
            background: disabled ? "#f9fafb" : "#fff",
            color: disabled ? "#9ca3af" : "#222",
            paddingRight: 30,
          }}
          value={display}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length > 0) pick(filtered[0]);
              return;
            }
            if (e.key === "ArrowDown" && !open) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            if (onBlur) onBlur({ target: { value: selected } });
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#9ca3af",
            fontSize: 10,
          }}
        >
          ▼
        </span>
      </div>

      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 50,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {filtered.length === 0 && (
            <div
              style={{
                padding: "10px 12px",
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              —
            </div>
          )}
          {filtered.map((opt) => {
            const active = opt.value === selected;
            return (
              <div
                key={opt.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(opt);
                }}
                style={{
                  padding: "9px 12px",
                  fontSize: 14,
                  cursor: "pointer",
                  background: active ? "#fff7ed" : "#fff",
                  color: active ? "#F97316" : "#222",
                  fontWeight: active ? 700 : 400,
                  borderBottom: "1px solid #f3f4f6",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = active ? "#fff7ed" : "#fff";
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}

      {hasError && (
        <span style={{ fontSize: 11, color: "#e53e3e", display: "block", marginTop: 4 }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
