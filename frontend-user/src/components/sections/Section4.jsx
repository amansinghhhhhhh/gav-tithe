import SectionHeader from "../shared/SectionHeader";
import { useEffect } from "react";
import { useLang } from "../../context/LangContext";
import DocUploadBox from "../shared/DocUploadBox";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import useValidation from "../../hooks/useValidation";
import { ValidatedInput } from "../shared/ValidatedInput";
import { uploadDoc } from "../../services/api";

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
  accountNo: (v) => {
    if (!v?.trim()) return null; // optional field
    if (!/^\d+$/.test(v)) return t("err_acc_digits");
    if (v.length < 9 || v.length > 18) return t("err_acc_length");
    return null;
  },
  "docs.aadhaarFront": (v) => (!v ? t("err_doc_required") : null),
  "docs.aadhaarBack": (v) => (!v ? t("err_doc_required") : null),
  "docs.pan": (v) => (!v ? t("err_doc_required") : null),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function Section4({ data, dispatch, registerNext, onNext }) {
  const { t } = useLang();
  const u = (p) => dispatch({ type: "UPDATE_SECTION4", payload: p });
  const ud = (k, f) => dispatch({ type: "UPDATE_DOC", key: k, file: f });

  const handleDocUpload = async (key, file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      alert(t("s4_file_too_large") || "File 5MB se choti honi chahiye");
      return;
    }
    try {
      const res = await uploadDoc(key, file);
      if (res.success) {
        ud(key, res.fileId);
        clearError(`docs.${key}`);
      } else {
        alert(res.message || "Upload failed");
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  const { errors, validateField, validateAll, clearError } = useValidation(
    makeRules(t),
  );

  const handleNext = () => {
    const isValid = validateAll({
      aadhaar: data.aadhaar,
      pan: data.pan,
      accountNo: data.accountNo,
      "docs.aadhaarFront": data.docs.aadhaarFront,
      "docs.aadhaarBack": data.docs.aadhaarBack,
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
            <div style={{ flex: 1, minWidth: 160 }}>
              <input
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                placeholder={t("s4_bank_name_ph")}
                value={data.bankName}
                onChange={(e) => u({ bankName: e.target.value })}
              />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <ValidatedInput
                placeholder={t("s4_acc_ph")}
                value={data.accountNo}
                maxLength={18}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  u({ accountNo: digits });
                  clearError("accountNo");
                }}
                onBlur={() => validateField("accountNo", data.accountNo, data)}
                error={errors.accountNo}
              />
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div>
          <label style={labelStyle}>{t("s4_upload")}</label>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>
            {t("s4_upload_hint")}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <DocUploadBox
              label={t("s4_doc_aadh_front")}
              uploaded={!!data.docs.aadhaarFront}
              onUpload={(f) => handleDocUpload("aadhaarFront", f)}
              error={errors["docs.aadhaarFront"]}
            />
            <DocUploadBox
              label={t("s4_doc_aadh_back")}
              uploaded={!!data.docs.aadhaarBack}
              onUpload={(f) => handleDocUpload("aadhaarBack", f)}
              error={errors["docs.aadhaarBack"]}
            />
            <DocUploadBox
              label={t("s4_doc_pan")}
              uploaded={!!data.docs.pan}
              onUpload={(f) => handleDocUpload("pan", f)}
              error={errors["docs.pan"]}
            />
            <DocUploadBox
              label={t("s4_doc_udyam")}
              sublabel={t("s4_doc_udyam_sub")}
              uploaded={!!data.docs.udyam}
              onUpload={(f) => handleDocUpload("udyam", f)}
            />
            <DocUploadBox
              label={t("s4_doc_pass")}
              uploaded={!!data.docs.passport}
              onUpload={(f) => handleDocUpload("passport", f)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section4;
