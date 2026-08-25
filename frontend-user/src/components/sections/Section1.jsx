import { useState, useEffect } from "react";
import { RadioGroup } from "../shared/RadioGroup";
import { useLang } from "../../context/LangContext";
import { useAuth } from "../../context/AuthContext";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import C from "../../constants/colors";
import SectionHeader from "../shared/SectionHeader";
import { ValidatedInput, ValidatedSelect } from "../shared/ValidatedInput";
import useValidation from "../../hooks/useValidation";
import useOtp from "../../hooks/useOtp";
import { Spinner, OtpVerifyLoader } from "../shared/Spinner";
import { districts, getTalukas } from "../../constants/maharashtraData";
import { getVillages } from "../../constants/maharashtraVillages";

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
  // ✅ address object validation — sabhi fields required
  "address.dist": (v) => (!v?.trim() ? t("err_required") : null),
  "address.taluka": (v) => (!v?.trim() ? t("err_required") : null),
  "address.village": (v) => (!v?.trim() ? t("err_required") : null),
  "address.pincode": (v) =>
    !v?.trim()
      ? t("err_required")
      : !/^\d{6}$/.test(v.trim())
        ? t("err_pincode")
        : null,
});

function Section1({ data, dispatch, registerNext, onNext, assessmentCompleted, assessmentScore, onGoToAssessment }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [otpInput, setOtpInput] = useState("");
  const [countdown, setCountdown] = useState(0);

  // countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const u = (p) => dispatch({ type: "UPDATE_SECTION1", payload: p });

  // address field shortcut
  const uAddr = (field, val) =>
    u({ address: { ...data.address, [field]: val } });

  const { errors, validateField, validateAll, clearError } = useValidation(
    makeRules(t),
  );

  const {
    otpSent,
    otpVerified: firebaseVerified,
    loading: otpLoading,
    error: otpError,
    sendOtp,
    verifyOtp,
    reset,
  } = useOtp();

  // Auto-verify if user already has firebaseUid (OTP done during registration)
  useEffect(() => {
    if (user?.firebaseUid && user?.mobile) {
      u({ mobile: user.mobile, otpVerified: true });
      localStorage.setItem("otp_verified", "true");
      clearError("otpVerified");
    }
  }, [user?.firebaseUid, user?.mobile]);

  useEffect(() => {
    if (firebaseVerified) {
      u({ otpVerified: true });
      clearError("otpVerified");
    }
  }, [firebaseVerified]);

  const handleNext = () => {
    const isValid = validateAll({
      fullName: data.fullName,
      dob: data.dob,
      mobile: data.mobile,
      otpVerified: data.otpVerified,
      education: data.education,
      "address.dist": data.address?.dist,
      "address.taluka": data.address?.taluka,
      "address.village": data.address?.village,
      "address.pincode": data.address?.pincode,
    });
    if (isValid) onNext();
  };

  useEffect(() => {
    registerNext(handleNext);
  });

  const handleSendOtp = () => {
    if (data.mobile.length === 10) {
      sendOtp(data.mobile);
      setCountdown(59);
    }
  };

  const handleEditNumber = () => {
    reset();
    setOtpInput("");
    setCountdown(0);
    u({ mobile: data.mobile, otpVerified: false });
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length >= 4) await verifyOtp(otpInput, data.mobile);
  };

  return (
    <div style={sectionCardStyle}>
      <div id="recaptcha-container" />
      <SectionHeader title={t("s1_title")} badge={t("s1_badge")} />

      {/* ── Mindset Assessment Card ── */}
      <div
        style={{
          background: assessmentCompleted
            ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
            : "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
          border: assessmentCompleted
            ? "2px solid #86efac"
            : "2px solid #fdba74",
          borderRadius: 14,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: assessmentCompleted ? "#16a34a" : C.orange,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {assessmentCompleted ? "✓" : "🎓"}
          </div>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: assessmentCompleted ? "#166534" : C.navy,
              }}
            >
              {assessmentCompleted
                ? "Mindset Assessment Completed"
                : "Mindset Creation Assessment"}
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: assessmentCompleted ? "#166534" : "#78350f",
                lineHeight: 1.5,
              }}
            >
              {assessmentCompleted
                ? `Score: ${assessmentScore}/15 | You can proceed to the next step`
                : "Complete the 'Entrepreneurial Mindset Creation' quiz to prove employer readiness"}
            </p>
            {!assessmentCompleted && (
              <button
                onClick={onGoToAssessment}
                style={{
                  marginTop: 12,
                  padding: "10px 24px",
                  background: C.orange,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ▶ Start Assessment
              </button>
            )}
            {assessmentCompleted && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "5px 14px",
                  background: "#16a34a",
                  color: "#fff",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✅ Score: {assessmentScore}/15
              </span>
            )}
          </div>
        </div>
      </div>

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
                disabled={otpSent || data.otpVerified}
                onChange={(e) => {
                  u({ mobile: e.target.value });
                  clearError("mobile");
                }}
                onBlur={(e) => validateField("mobile", e.target.value, data)}
              />
              {/* Edit button — OTP sent hone ke baad number change karne ke liye */}
              {otpSent && !data.otpVerified && (
                <button
                  onClick={handleEditNumber}
                  style={{
                    padding: "10px 12px",
                    background: "none",
                    border: `1.5px solid ${C.navy}`,
                    borderRadius: 8,
                    color: C.navy,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✏ {t("s1_edit_number") || "Edit"}
                </button>
              )}
              {!otpSent && !data.otpVerified && (
                <button
                  onClick={handleSendOtp}
                  disabled={otpLoading || data.mobile.length !== 10}
                  style={{
                    padding: "10px 14px",
                    background: otpLoading ? "#aaa" : C.green,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: otpLoading ? "not-allowed" : "pointer",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {otpLoading && <Spinner size={16} style={{ filter: "brightness(0) invert(1)" }} />}
                  {otpLoading ? "..." : t("s1_get_otp")}
                </button>
              )}
            </div>

            {otpError && (
              <div style={{ fontSize: 12, color: "#e53e3e", marginTop: 4 }}>
                ⚠ {otpError}
              </div>
            )}
            {errors.mobile && (
              <span style={{ fontSize: 11, color: "#e53e3e" }}>
                ⚠ {errors.mobile}
              </span>
            )}

            {otpSent && !data.otpVerified && (
              <>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    style={{
                      ...inputStyle,
                      flex: 1,
                      border: `1.5px solid ${errors.otpVerified ? "#e53e3e" : "#ddd"}`,
                    }}
                    placeholder={t("s1_otp_ph")}
                    value={otpInput}
                    onChange={(e) =>
                      setOtpInput(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={6}
                    disabled={otpLoading}
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpInput.length < 4}
                    style={{
                      padding: "10px 14px",
                      background: otpLoading ? "#aaa" : C.navy,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      cursor: otpLoading ? "not-allowed" : "pointer",
                      fontSize: 13,
                    }}
                  >
                    {t("s1_verify")}
                  </button>
                </div>
                {otpLoading && <OtpVerifyLoader />}
              </>
            )}

            {otpSent && !data.otpVerified && (
              <button
                onClick={handleSendOtp}
                disabled={otpLoading || countdown > 0}
                style={{
                  background: "none",
                  border: "none",
                  color: countdown > 0 ? "#9ca3af" : C.green,
                  cursor: countdown > 0 ? "not-allowed" : "pointer",
                  fontSize: 12,
                  marginTop: 4,
                  padding: 0,
                  fontWeight: 600,
                }}
              >
                {countdown > 0
                  ? `${t("s1_resend_wait") || "Resend in"} ${countdown}s`
                  : t("s1_resend_otp") || "Resend OTP"}
              </button>
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

        {/* ✅ Address — cascading dropdowns */}
        <div>
          <label style={labelStyle}>{t("s1_address")}</label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

            {/* District dropdown */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <select
                style={{
                  ...inputStyle,
                  border: `1.5px solid ${errors["address.dist"] ? "#e53e3e" : "#ddd"}`,
                  cursor: "pointer",
                }}
                value={data.address?.dist || ""}
                onChange={(e) => {
                  u({ address: { ...data.address, dist: e.target.value, taluka: "", village: "", pincode: "" } });
                  clearError("address.dist");
                  clearError("address.taluka");
                  clearError("address.village");
                }}
                onBlur={(e) => validateField("address.dist", e.target.value, data)}
              >
                <option value="">{t("s1_dist_ph")}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors["address.dist"] && (
                <span style={{ fontSize: 11, color: "#e53e3e" }}>⚠ {errors["address.dist"]}</span>
              )}
            </div>

            {/* Taluka dropdown */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <select
                style={{
                  ...inputStyle,
                  border: `1.5px solid ${errors["address.taluka"] ? "#e53e3e" : "#ddd"}`,
                  background: data.address?.dist ? "#fff" : "#f9fafb",
                  cursor: data.address?.dist ? "pointer" : "not-allowed",
                  color: data.address?.dist ? "#222" : "#9ca3af",
                }}
                value={data.address?.taluka || ""}
                disabled={!data.address?.dist}
                onChange={(e) => {
                  u({ address: { ...data.address, taluka: e.target.value, village: "", pincode: "" } });
                  clearError("address.taluka");
                  clearError("address.village");
                }}
                onBlur={(e) => validateField("address.taluka", e.target.value, data)}
              >
                <option value="">{t("s1_taluka_ph")}</option>
                {getTalukas(data.address?.dist).map((tk) => (
                  <option key={tk} value={tk}>{tk}</option>
                ))}
              </select>
              {errors["address.taluka"] && (
                <span style={{ fontSize: 11, color: "#e53e3e" }}>⚠ {errors["address.taluka"]}</span>
              )}
            </div>

            {/* Village dropdown */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <select
                style={{
                  ...inputStyle,
                  border: `1.5px solid ${errors["address.village"] ? "#e53e3e" : "#ddd"}`,
                  background: data.address?.taluka ? "#fff" : "#f9fafb",
                  cursor: data.address?.taluka ? "pointer" : "not-allowed",
                  color: data.address?.taluka ? "#222" : "#9ca3af",
                }}
                value={data.address?.village || ""}
                disabled={!data.address?.taluka}
                onChange={(e) => {
                  uAddr("village", e.target.value);
                  clearError("address.village");
                }}
                onBlur={(e) => validateField("address.village", e.target.value, data)}
              >
                <option value="">{t("s1_village_ph")}</option>
                {getVillages(data.address?.dist, data.address?.taluka).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
                <option value="__other__">{t("s1_village_other") || "Other"}</option>
              </select>
              {errors["address.village"] && (
                <span style={{ fontSize: 11, color: "#e53e3e" }}>⚠ {errors["address.village"]}</span>
              )}
              {data.address?.village === "__other__" && (
                <input
                  style={{ ...inputStyle, marginTop: 8 }}
                  placeholder={t("s1_village_custom_ph") || "Type your village..."}
                  value={data.address?.villageCustom || ""}
                  onChange={(e) => uAddr("villageCustom", e.target.value)}
                />
              )}
            </div>

            {/* Pincode — manual input */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <input
                style={{
                  ...inputStyle,
                  border: `1.5px solid ${errors["address.pincode"] ? "#e53e3e" : "#ddd"}`,
                }}
                placeholder={t("s1_pincode") || "Pincode"}
                value={data.address?.pincode || ""}
                maxLength={6}
                inputMode="numeric"
                onChange={(e) => {
                  uAddr("pincode", e.target.value.replace(/\D/g, ""));
                  clearError("address.pincode");
                }}
                onBlur={(e) => validateField("address.pincode", e.target.value, data)}
              />
              {errors["address.pincode"] && (
                <span style={{ fontSize: 11, color: "#e53e3e" }}>⚠ {errors["address.pincode"]}</span>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Section1;
