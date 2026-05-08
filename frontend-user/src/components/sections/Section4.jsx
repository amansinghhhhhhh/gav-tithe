import SectionHeader from "../shared/SectionHeader";
import { useEffect } from "react";
import { useLang } from "../../context/LangContext";
import DocUploadBox from "../shared/DocUploadBox";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import useValidation from "../../hooks/useValidation";
import { ValidatedInput } from "../shared/ValidatedInput";

const makeRules = (t) => ({
  aadhaar: (v) =>
    !v?.trim()
      ? t("err_required")
      : v.replace(/\s/g, "").length !== 12
        ? t("err_aadhaar")
        : null,
  pan: (v) =>
    !v?.trim()
      ? t("err_required")
      : !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.trim())
        ? t("err_pan")
        : null,
  "docs.aadhaar": (v) => (!v ? t("err_doc_required") : null),
  "docs.pan": (v) => (!v ? t("err_doc_required") : null),
});

function Section4({ data, dispatch, registerNext, onNext }) {
  const { t } = useLang();
  const u = (p) => dispatch({ type: "UPDATE_SECTION4", payload: p });
  const ud = (k, f) => dispatch({ type: "UPDATE_DOC", key: k, file: f });

  const { errors, validateField, validateAll, clearError } = useValidation(
    makeRules(t),
  );

  const handleNext = () => {
    const isValid = validateAll({
      aadhaar: data.aadhaar,
      pan: data.pan,
      "docs.aadhaar": data.docs.aadhaar,
      "docs.pan": data.docs.pan,
    });
    if (isValid) onNext();
  };

  useEffect(() => {
    registerNext(handleNext);
  });

  return (
    <div style={sectionCardStyle}>
      <SectionHeader title={t("s4_title")} subtitle={t("s4_subtitle")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <ValidatedInput
              label={t("s4_aadhaar")}
              placeholder={t("s4_aadhaar_ph")}
              maxLength={14}
              value={data.aadhaar}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 12);
                v = v.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
                u({ aadhaar: v });
                clearError("aadhaar");
              }}
              onBlur={() => validateField("aadhaar", data.aadhaar, data)}
              error={errors.aadhaar}
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <ValidatedInput
              label={t("s4_pan")}
              placeholder={t("s4_pan_ph")}
              maxLength={10}
              value={data.pan}
              onChange={(e) => {
                u({ pan: e.target.value.toUpperCase() });
                clearError("pan");
              }}
              onBlur={() => validateField("pan", data.pan, data)}
              error={errors.pan}
            />
            <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>
              {t("s4_pan_sub")}
            </p>
          </div>
        </div>

        {/* Bank Details optional */}
        <div>
          <label style={labelStyle}>{t("s4_bank")}</label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <input
              style={{ ...inputStyle, flex: 1, minWidth: 160 }}
              placeholder={t("s4_bank_name_ph")}
              value={data.bankName}
              onChange={(e) => u({ bankName: e.target.value })}
            />
            <input
              style={{ ...inputStyle, flex: 1, minWidth: 160 }}
              placeholder={t("s4_acc_ph")}
              value={data.accountNo}
              onChange={(e) => u({ accountNo: e.target.value })}
            />
          </div>
        </div>

        {/* Document Uploads */}
        <div>
          <label style={labelStyle}>{t("s4_upload")}</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 110 }}>
              <DocUploadBox
                label={t("s4_doc_aadh")}
                sublabel={t("s4_doc_aadh_sub")}
                uploaded={!!data.docs.aadhaar}
                onUpload={(f) => {
                  ud("aadhaar", f);
                  clearError("docs.aadhaar");
                }}
              />
              {errors["docs.aadhaar"] && (
                <span
                  style={{
                    fontSize: 10,
                    color: "#e53e3e",
                    display: "block",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  ⚠ {errors["docs.aadhaar"]}
                </span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 110 }}>
              <DocUploadBox
                label={t("s4_doc_pan")}
                uploaded={!!data.docs.pan}
                onUpload={(f) => {
                  ud("pan", f);
                  clearError("docs.pan");
                }}
              />
              {errors["docs.pan"] && (
                <span
                  style={{
                    fontSize: 10,
                    color: "#e53e3e",
                    display: "block",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  ⚠ {errors["docs.pan"]}
                </span>
              )}
            </div>
            <DocUploadBox
              label={t("s4_doc_udyam")}
              sublabel={t("s4_doc_udyam_sub")}
              uploaded={!!data.docs.udyam}
              onUpload={(f) => ud("udyam", f)}
            />
            <DocUploadBox
              label={t("s4_doc_pass")}
              uploaded={!!data.docs.passport}
              onUpload={(f) => ud("passport", f)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section4;
