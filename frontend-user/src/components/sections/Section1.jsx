import { useState, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { useAuth } from "../../context/AuthContext";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import C from "../../constants/colors";
import SectionHeader from "../shared/SectionHeader";
import { ValidatedInput, ValidatedSelect } from "../shared/ValidatedInput";
import SearchSelect from "../shared/SearchSelect";
import useValidation from "../../hooks/useValidation";
import useOtp from "../../hooks/useOtp";
import { Spinner, OtpVerifyLoader } from "../shared/Spinner";
import { districts, getTalukas } from "../../constants/maharashtraData";

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_MR = [
  "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
  "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर",
];

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const d = String(i + 1).padStart(2, "0");
  return { value: d, label: String(i + 1) };
});
const YEAR_OPTIONS = Array.from({ length: 2026 - 1876 + 1 }, (_, i) => {
  const y = String(2026 - i);
  return { value: y, label: y };
});

const makeRules = (t) => ({
  fullName: (v) =>
    !v?.trim() ? t("err_required") : v.trim().length < 3 ? t("err_min3") : null,
  dob: (v) => {
    if (!v) return t("err_required");
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) {
      if (v.split("-").some((s) => !s)) return t("err_required");
      return t("err_dob_invalid");
    }
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (y < 1876 || y > 2026) return t("err_dob_range");
    const dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d)
      return t("err_dob_invalid");
    return null;
  },
  mobile: (v) =>
    !v?.trim()
      ? t("err_required")
      : /^[6-9]\d{9}$/.test(v.trim())
        ? null
        : t("err_mobile"),
  gender: (v) => (!v ? t("err_required") : null),
  otpVerified: (v) => (!v ? t("err_otp") : null),
  education: (v) => (!v ? t("err_required") : null),
  // ✅ address object validation — sabhi fields required
  "address.dist": (v) => (!v?.trim() ? t("err_required") : null),
  "address.taluka": (v) => (!v?.trim() ? t("err_required") : null),
  "address.village": (v, allData) => {
    if (!v?.trim()) return t("err_required");
    if (v === "__other__" && !allData["address.villageCustom"]?.trim()) {
      return t("err_required");
    }
    return null;
  },
  "address.pincode": (v) =>
    !v?.trim()
      ? t("err_required")
      : !/^\d{6}$/.test(v.trim())
        ? t("err_pincode")
        : null,
  referrerMobile: (v) => {
    if (!v?.trim()) return null;
    return /^[6-9]\d{9}$/.test(v.trim()) ? null : t("err_mobile");
  },
});

function Section1({ data, dispatch, registerNext, onNext }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [otpInput, setOtpInput] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [villageData, setVillageData] = useState(null);

  // Lazy-load village directory (~850KB) only when address section needs it
  useEffect(() => {
    let alive = true;
    import("../../constants/maharashtraVillages").then((mod) => {
      if (alive) setVillageData(mod);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const getVillages = (district, taluka) =>
    villageData?.getVillages?.(district, taluka) || [];

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

  // Auto-fill name & email from registration data (sirf jab form empty ho)
  useEffect(() => {
    if (user?.name && !data.fullName) {
      u({ fullName: user.name });
    }
    if (user?.email && !data.email) {
      u({ email: user.email });
    }
  }, [user?.name, user?.email]);

  // Email locked — registration email hi source of truth (edit disabled)
  useEffect(() => {
    if (user?.email && data.email && data.email !== user.email) {
      u({ email: user.email });
    }
  }, [user?.email]);

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
      gender: data.gender,
      mobile: data.mobile,
      otpVerified: data.otpVerified,
      education: data.education,
      "address.dist": data.address?.dist,
      "address.taluka": data.address?.taluka,
      "address.village": data.address?.village,
      "address.villageCustom": data.address?.villageCustom,
      "address.pincode": data.address?.pincode,
      referrerMobile: data.referrerMobile,
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

  // DOB helpers — data.dob stays "YYYY-MM-DD" (backend compatible)
  const [dobY, dobM, dobD] = (data.dob || "").split("-");
  const monthOpts = (lang === "mr" ? MONTHS_MR : MONTHS_EN).map((label, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label,
  }));

  const setDobPart = (part, val) => {
    let y = dobY || "";
    let m = dobM || "";
    let d = dobD || "";
    if (part === "d") d = val;
    if (part === "m") m = val;
    if (part === "y") y = val;
    const assembled = `${y}-${m}-${d}`;
    u({ dob: assembled });
    clearError("dob");
    if (y && m && d) validateField("dob", assembled, data);
  };

  return (
    <div style={sectionCardStyle}>
      <div id="recaptcha-container" />
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

        {/* DOB + Gender — side by side */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: "2 1 300px", minWidth: 280 }}>
            <label style={labelStyle}>{t("s1_dob")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", gap: 8 }}>
              <SearchSelect
                value={dobD || ""}
                placeholder={t("s1_dob_day_ph")}
                options={DAY_OPTIONS}
                onChange={(e) => setDobPart("d", e.target.value)}
                onBlur={() => { if (dobY && dobM && dobD) validateField("dob", data.dob, data); }}
                error=""
              />
              <SearchSelect
                value={dobM || ""}
                placeholder={t("s1_dob_month_ph")}
                options={monthOpts}
                onChange={(e) => setDobPart("m", e.target.value)}
                onBlur={() => { if (dobY && dobM && dobD) validateField("dob", data.dob, data); }}
                error=""
              />
              <SearchSelect
                value={dobY || ""}
                placeholder={t("s1_dob_year_ph")}
                options={YEAR_OPTIONS}
                onChange={(e) => setDobPart("y", e.target.value)}
                onBlur={() => { if (dobY && dobM && dobD) validateField("dob", data.dob, data); }}
                error=""
              />
            </div>
            {errors.dob && (
              <span style={{ fontSize: 11, color: "#e53e3e", marginTop: 4, display: "block" }}>
                ⚠ {errors.dob}
              </span>
            )}
          </div>

          <div style={{ flex: "1 1 180px", minWidth: 180 }}>
            <label style={labelStyle}>{t("s1_gender")}</label>
            <SearchSelect
              value={data.gender || ""}
              placeholder={t("s1_gender_ph")}
              options={[
                { value: "purush", label: t("s1_male") },
                { value: "mahila", label: t("s1_female") },
                { value: "itar", label: t("s1_other") },
              ]}
              onChange={(e) => {
                u({ gender: e.target.value });
                clearError("gender");
              }}
              onBlur={(e) => validateField("gender", e.target.value, data)}
              error={errors.gender || ""}
            />
          </div>
        </div>

        {/* Mobile + OTP */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
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
            <label style={labelStyle}>{t("s1_email")}</label>
            <input
              style={{
                ...inputStyle,
                width: "100%",
                boxSizing: "border-box",
                background: "#f5f5f5",
                color: "#555",
                cursor: "not-allowed",
              }}
              type="email"
              placeholder={t("s1_email_ph")}
              value={data.email || user?.email || ""}
              disabled
              readOnly
            />
            {user?.emailVerified ? (
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
            ) : (
              <div
                style={{
                  color: "#e53e3e",
                  fontSize: 12,
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {t("s1_email_unverified")}
              </div>
            )}
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

        {/* Referral fields (optional) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <ValidatedInput
            label={t("s1_referredby")}
            placeholder={t("s1_referredby_ph")}
            value={data.referredBy || ""}
            onChange={(e) => u({ referredBy: e.target.value })}
          />
          <div>
            <label style={labelStyle}>{t("s1_referrer_mobile")}</label>
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
                  border: `1.5px solid ${errors.referrerMobile ? "#e53e3e" : "#ddd"}`,
                }}
                placeholder={t("s1_referrer_mobile_ph")}
                maxLength={10}
                inputMode="numeric"
                value={data.referrerMobile || ""}
                onChange={(e) => {
                  u({ referrerMobile: e.target.value.replace(/\D/g, "").slice(0, 10) });
                  clearError("referrerMobile");
                }}
                onBlur={(e) => validateField("referrerMobile", e.target.value, data)}
              />
            </div>
            {errors.referrerMobile && (
              <span style={{ fontSize: 11, color: "#e53e3e", marginTop: 4, display: "block" }}>
                ⚠ {errors.referrerMobile}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Address — cascading searchable dropdowns */}
        <div>
          <label style={labelStyle}>{t("s1_address")}</label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

            {/* District */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <SearchSelect
                value={data.address?.dist || ""}
                placeholder={t("s1_dist_ph")}
                options={districts}
                onChange={(e) => {
                  u({ address: { ...data.address, dist: e.target.value, taluka: "", village: "", villageCustom: "", pincode: "" } });
                  clearError("address.dist");
                  clearError("address.taluka");
                  clearError("address.village");
                }}
                onBlur={(e) => validateField("address.dist", e.target.value, data)}
                error={errors["address.dist"]}
              />
            </div>

            {/* Taluka */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <SearchSelect
                value={data.address?.taluka || ""}
                placeholder={t("s1_taluka_ph")}
                options={getTalukas(data.address?.dist)}
                disabled={!data.address?.dist}
                onChange={(e) => {
                  u({ address: { ...data.address, taluka: e.target.value, village: "", villageCustom: "", pincode: "" } });
                  clearError("address.taluka");
                  clearError("address.village");
                }}
                onBlur={(e) => validateField("address.taluka", e.target.value, data)}
                error={errors["address.taluka"]}
              />
            </div>

            {/* Village */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <SearchSelect
                value={data.address?.village || ""}
                placeholder={t("s1_village_ph")}
                options={[
                  ...getVillages(data.address?.dist, data.address?.taluka).map((v) => ({
                    value: v,
                    label: v,
                  })),
                  { value: "__other__", label: t("s1_village_other") || "Other" },
                ]}
                disabled={!data.address?.taluka}
                onChange={(e) => {
                  const val = e.target.value;
                  u({
                    address: {
                      ...data.address,
                      village: val,
                      villageCustom:
                        val === "__other__" ? (data.address?.villageCustom || "") : "",
                    },
                  });
                  clearError("address.village");
                }}
                onBlur={(e) => validateField("address.village", e.target.value, data)}
                error={
                  data.address?.village === "__other__"
                    ? null
                    : errors["address.village"]
                }
              />
              {data.address?.village === "__other__" && (
                <>
                  <input
                    style={{
                      ...inputStyle,
                      marginTop: 8,
                      border: `1.5px solid ${
                        errors["address.village"] && !data.address?.villageCustom?.trim()
                          ? "#e53e3e"
                          : "#ddd"
                      }`,
                    }}
                    placeholder={t("s1_village_custom_ph") || "Type your village..."}
                    value={data.address?.villageCustom || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      uAddr("villageCustom", val);
                      if (val.trim()) {
                        clearError("address.village");
                      } else {
                        validateField("address.village", "__other__", {
                          ...data,
                          address: { ...data.address, villageCustom: val },
                        });
                      }
                    }}
                    onBlur={(e) =>
                      validateField("address.village", "__other__", {
                        ...data,
                        address: { ...data.address, villageCustom: e.target.value },
                      })
                    }
                  />
                  {errors["address.village"] && !data.address?.villageCustom?.trim() && (
                    <span style={{ fontSize: 11, color: "#e53e3e", marginTop: 4, display: "block" }}>
                      ⚠ {t("err_required")}
                    </span>
                  )}
                </>
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
