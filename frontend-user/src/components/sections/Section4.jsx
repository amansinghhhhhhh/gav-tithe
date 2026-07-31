import SectionHeader from "../shared/SectionHeader";
import { useEffect } from "react";
import { useLang } from "../../context/LangContext";
import DocUploadBox from "../shared/DocUploadBox";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import useValidation from "../../hooks/useValidation";
import { ValidatedInput } from "../shared/ValidatedInput";
import { uploadDoc } from "../../services/api";
import { extractDocNumber, aadhaarDiff, panMatches } from "../../services/ocr";

// Jin doc types ke liye document-number match check hoga
const OCR_KEYS = { aadhaarFront: "aadhaar", pan: "pan" };

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

const OCR_STATUS_STYLE = {
  checking: { color: "#d97706", icon: "⏳" },
  match: { color: "#16a34a", icon: "✅" },
  mismatch: { color: "#dc2626", icon: "❌" },
  unreadable: { color: "#dc2626", icon: "⚠️" },
  reupload: { color: "#d97706", icon: "🔒" },
  suggest: { color: "#d97706", icon: "💡" },
  type: { color: "#9ca3af", icon: "ℹ️" },
};

function Section4({ data, dispatch, registerNext, onNext, editAllowed = false }) {
  const { t } = useLang();
  const u = (p) => dispatch({ type: "UPDATE_SECTION4", payload: p });
  const ud = (k, f) => dispatch({ type: "UPDATE_DOC", key: k, file: f });
  const uo = (p) => dispatch({ type: "UPDATE_OCR", payload: p });

  // Document-number match status: null | checking | type | match | mismatch | unreadable | reupload | suggest
  const getOcrStatus = (docKey) => {
    if (!data.docs?.[docKey]) return null;
    const ocr = data.ocr?.[docKey];
    if (data.ocr?.[`${docKey}Pending`]) return "checking";
    if (!ocr) {
      // Edit access milne ke baad security ke liye doc dobara upload karna zaroori hai
      return editAllowed ? "reupload" : "unreadable";
    }
    if (docKey === "aadhaarFront") {
      const typed = (data.aadhaar || "").replace(/\s/g, "");
      if (!typed) return "type";
      const diff = aadhaarDiff(typed, ocr);
      if (diff === 0) return "match";
      // 1 digit door hai → green ✅ nahi, suggestion dikhao (user verify kare)
      return diff === 1 ? "suggest" : "mismatch";
    }
    const typed = (data.pan || "").trim();
    if (!typed) return "type";
    if (typed === ocr) return "match";
    // 1-char door hai → green ✅ mat dikhao, suggestion dikhao (user verify kare)
    return panMatches(typed, ocr) ? "suggest" : "mismatch";
  };

  const OcrStatus = ({ docKey, showExtracted }) => {
    const status = getOcrStatus(docKey);
    if (!status) return null;
    const s = OCR_STATUS_STYLE[status];
    const extracted = data.ocr?.[docKey];

    if (status === "suggest") {
      return (
        <p style={{ fontSize: 11, color: s.color, margin: "4px 0 0", fontWeight: 500 }}>
          {s.icon} {t("ocr_suggest")}{" "}
          <b style={{ letterSpacing: 1 }}>{extracted}</b>{" "}
          <button
            type="button"
            onClick={() => {
              const value =
                docKey === "aadhaarFront"
                  ? (extracted || "").replace(/(\d{4})(?=\d)/g, "$1 ").trim()
                  : extracted;
              u(docKey === "aadhaarFront" ? { aadhaar: value } : { pan: value });
              clearError(docKey === "aadhaarFront" ? "aadhaar" : "pan");
            }}
            style={{
              marginLeft: 4,
              fontSize: 11,
              fontWeight: 600,
              color: "#b45309",
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: 6,
              padding: "1px 8px",
              cursor: "pointer",
            }}
          >
            {t("ocr_use")}
          </button>
        </p>
      );
    }

    const showExtractedValue = showExtracted && extracted;
    return (
      <p style={{ fontSize: 11, color: s.color, margin: "4px 0 0", fontWeight: 500 }}>
        {s.icon} {t(`ocr_${status}`)}
        {showExtractedValue ? ` (${extracted})` : ""}
      </p>
    );
  };

  const handleDocUpload = async (key, file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      alert(t("s4_file_too_large") || "File 5MB se choti honi chahiye");
      return;
    }

    let ocrNumber = null;
    if (OCR_KEYS[key]) {
      uo({ [`${key}Pending`]: true, [key]: null });
      try {
        const result = await extractDocNumber(file);
        if (result.ok) {
          ocrNumber = key === "aadhaarFront" ? result.aadhaar : result.pan;
          uo({ [key]: ocrNumber || null });
        }
      } catch (err) {
        console.error("OCR failed:", err);
      } finally {
        uo({ [`${key}Pending`]: false });
      }
    }

    try {
      const res = await uploadDoc(key, file, ocrNumber);
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
    if (!isValid) return;

    const aStatus = getOcrStatus("aadhaarFront");
    const pStatus = getOcrStatus("pan");
    if (aStatus === "checking" || pStatus === "checking") {
      alert(t("ocr_checking"));
      return;
    }
    if (aStatus === "mismatch" || aStatus === "suggest") {
      alert(t("err_ocr_mismatch_aadhaar"));
      return;
    }
    if (pStatus === "mismatch" || pStatus === "suggest") {
      alert(t("err_ocr_mismatch_pan"));
      return;
    }
    if (aStatus === "reupload" || pStatus === "reupload") {
      alert(t("err_ocr_reupload"));
      return;
    }
    if (aStatus === "unreadable" || pStatus === "unreadable") {
      alert(t("err_ocr_unreadable"));
      return;
    }
    onNext();
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
            <OcrStatus docKey="aadhaarFront" showExtracted />
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
            <OcrStatus docKey="pan" showExtracted />
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
