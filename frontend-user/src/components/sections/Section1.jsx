import { useState, useEffect } from "react";
import { RadioGroup } from "../shared/RadioGroup";
import { useLang } from "../../context/LangContext";
import Select from "../shared/Select";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import C from "../../constants/colors";
import SectionHeader from "../shared/SectionHeader";
import { ValidatedInput, ValidatedSelect } from "../shared/ValidatedInput";
import useValidation from "../../hooks/useValidation";

// Validation rules for Section 1
const makeRules = (t) => ({
  fullName: (v) =>
    !v?.trim() ? t("err_required") : v.trim().length < 3 ? t("err_min3") : null,
  dob: (v) => (!v ? t("err_required") : null),
  mobile: (v) =>
    !v?.trim()
      ? t("err_required")
      : !/^\d{10}$/.test(v.trim())
        ? t("err_mobile")
        : null,
  otpVerified: (v) => (!v ? t("err_otp") : null),
  education: (v) => (!v ? t("err_required") : null),
  address: (v) =>
    !v?.trim()
      ? t("err_required")
      : v.trim().length < 10
        ? t("err_min10")
        : null,
});

function Section1({ data, dispatch, registerNext, onNext }) {
  const { t } = useLang();
  const [otpInput, setOtpInput] = useState("");
  const u = (p) => dispatch({ type: "UPDATE_SECTION1", payload: p });

  const { errors, validateField, validateAll, clearError } = useValidation(
    makeRules(t),
  );

  const handleNext = () => {
    const isValid = validateAll({
      fullName: data.fullName,
      dob: data.dob,
      mobile: data.mobile,
      otpVerified: data.otpVerified,
      education: data.education,
      address: data.address,
    });
    if (isValid) onNext();
  };

  // Register this section's handleNext with App.jsx
  useEffect(() => {
    registerNext(handleNext);
  });

  return (
    <div style={sectionCardStyle}>
      <SectionHeader title={t("s1_title")} badge={t("s1_badge")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <ValidatedInput
          label={t("s1_fullname")}
          placeholder={t("s1_fullname_ph")}
          value={data.fullName}
          onChange={(e) => {
            u({ fullName: e.target.value });
            clearError("fullName");
          }}
          onBlur={(e) => validateField("fullName", e.target.value, data)}
          error={errors.fullName}
        />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <ValidatedInput
              label={t("s1_dob")}
              type="date"
              value={data.dob}
              onChange={(e) => {
                u({ dob: e.target.value });
                clearError("dob");
              }}
              onBlur={(e) => validateField("dob", e.target.value, data)}
              error={errors.dob}
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={labelStyle}>{t("s1_gender")}</label>
            <RadioGroup
              name="gender"
              value={data.gender}
              options={[
                { value: "purush", label: t("s1_male") },
                { value: "mahila", label: t("s1_female") },
                { value: "itar", label: t("s1_other") },
              ]}
              onChange={(v) => u({ gender: v })}
            />
          </div>
        </div>

        {/* Mobile + OTP */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>{t("s1_mobile")}</label>
            <div style={{ display: "flex", gap: 8 }}>
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
                +91
              </div>
              <input
                style={{
                  ...inputStyle,
                  flex: 1,
                  border: `1.5px solid ${errors.mobile ? "#e53e3e" : "#ddd"}`,
                }}
                placeholder="9876543210"
                maxLength={10}
                value={data.mobile}
                onChange={(e) => {
                  u({ mobile: e.target.value });
                  clearError("mobile");
                }}
                onBlur={(e) => validateField("mobile", e.target.value, data)}
              />
              <button
                onClick={() => {
                  if (data.mobile.length === 10) u({ otpSent: true });
                }}
                style={{
                  padding: "10px 14px",
                  background: C.green,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                {t("s1_get_otp")}
              </button>
            </div>
            {errors.mobile && (
              <span style={{ fontSize: 11, color: "#e53e3e" }}>
                ⚠ {errors.mobile}
              </span>
            )}

            {data.otpSent && !data.otpVerified && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  style={{
                    ...inputStyle,
                    flex: 1,
                    border: `1.5px solid ${errors.otpVerified ? "#e53e3e" : "#ddd"}`,
                  }}
                  placeholder={t("s1_otp_ph")}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={6}
                />
                <button
                  onClick={() => {
                    if (otpInput.length >= 4) {
                      u({ otpVerified: true });
                      clearError("otpVerified");
                    }
                  }}
                  style={{
                    padding: "10px 14px",
                    background: C.navy,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {t("s1_verify")}
                </button>
              </div>
            )}
            {errors.otpVerified && (
              <span style={{ fontSize: 11, color: "#e53e3e" }}>
                ⚠ {errors.otpVerified}
              </span>
            )}
            {data.otpVerified && (
              <div
                style={{
                  color: C.green,
                  fontSize: 12,
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {t("s1_verified")}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <ValidatedInput
              label={t("s1_email")}
              placeholder={t("s1_email_ph")}
              value={data.email}
              onChange={(e) => u({ email: e.target.value })}
            />
          </div>
        </div>

        <ValidatedSelect
          label={t("s1_education")}
          placeholder={t("s1_edu_ph")}
          value={data.education}
          onChange={(e) => {
            u({ education: e.target.value });
            clearError("education");
          }}
          onBlur={(e) => validateField("education", e.target.value, data)}
          error={errors.education}
          options={[
            { value: "below10", label: t("s1_edu_1") },
            { value: "10th", label: t("s1_edu_2") },
            { value: "12th", label: t("s1_edu_3") },
            { value: "diploma", label: t("s1_edu_4") },
            { value: "graduate", label: t("s1_edu_5") },
            { value: "postgraduate", label: t("s1_edu_6") },
          ]}
        />

        <div>
          <label style={labelStyle}>{t("s1_address")}</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: 70,
              resize: "vertical",
              border: `1.5px solid ${errors.address ? "#e53e3e" : "#ddd"}`,
            }}
            placeholder={t("s1_address_ph")}
            value={data.address}
            onChange={(e) => {
              u({ address: e.target.value });
              clearError("address");
            }}
            onBlur={(e) => validateField("address", e.target.value, data)}
          />
          {errors.address && (
            <span style={{ fontSize: 11, color: "#e53e3e" }}>
              ⚠ {errors.address}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Section1;
