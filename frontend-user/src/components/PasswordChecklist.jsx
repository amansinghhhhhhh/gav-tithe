import { useLang } from "../context/LangContext";
import { Check, X } from "lucide-react";

export const isStrongPassword = (pw) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(String(pw || ""));

export function PasswordChecklist({ password }) {
  const { t } = useLang();
  const pw = password || "";
  const rules = [
    { ok: pw.length >= 8, label: t("pw_len") },
    { ok: /[A-Za-z]/.test(pw), label: t("pw_letter") },
    { ok: /\d/.test(pw), label: t("pw_number") },
  ];
  return (
    <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.4 }}>
        {t("pw_title")}
      </div>
      {rules.map((r) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: r.ok ? 600 : 500,
            color: r.ok ? "#16a34a" : "#94a3b8",
          }}
        >
          {r.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} />}
          {r.label}
        </div>
      ))}
    </div>
  );
}
