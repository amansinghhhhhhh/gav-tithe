import { useEffect } from "react";
import SectionHeader from "../shared/SectionHeader";
import { useLang } from "../../context/LangContext";
import Select from "../shared/Select";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import C from "../../constants/colors";
import useValidation from "../../hooks/useValidation";
import { ValidatedInput, ValidatedSelect } from "../shared/ValidatedInput";

const makeRules = (t) => ({
  businessType: (v) => (!v ? t("err_required") : null),
  sector: (v) => (!v ? t("err_required") : null),
  sectorOther: (v, all) =>
    all?.sector === "other" && !v?.trim() ? t("err_required") : null,
  businessStatus: (v) => (!v ? t("err_required") : null),
  employment: (v) => (!v?.trim() ? t("err_required") : null),
  investment: (v) =>
    !v?.trim() ? t("err_required") : isNaN(Number(v)) ? t("err_number") : null,
});

function Section2({ data, dispatch, registerNext, onNext }) {
  const { t } = useLang();
  const u = (p) => dispatch({ type: "UPDATE_SECTION2", payload: p });
  const { errors, validateField, validateAll, clearError } = useValidation(
    makeRules(t),
  );

  const handleNext = () => {
    const isValid = validateAll({
      businessType: data.businessType,
      sector: data.sector,
      sectorOther: data.sectorOther,
      businessStatus: data.businessStatus,
      employment: data.employment,
      investment: data.investment,
    });
    if (isValid) onNext();
  };

  useEffect(() => {
    registerNext(handleNext);
  });

  const statusOptions = [
    { value: "ideation", label: t("s2_st_idea") },
    { value: "new", label: t("s2_st_new") },
    { value: "established", label: t("s2_st_est") },
  ];

  return (
    <div style={sectionCardStyle}>
      <SectionHeader title={t("s2_title")} badge={t("s2_badge")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <ValidatedInput
          label={t("s2_biz_name")}
          placeholder={t("s2_biz_name_ph")}
          value={data.businessName}
          onChange={(e) => {
            u({ businessName: e.target.value });
            clearError("businessName");
          }}
          onBlur={(e) => validateField("businessName", e.target.value, data)}
          error={errors.businessName}
        />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <ValidatedSelect
              label={t("s2_biz_type")}
              placeholder={t("s2_biz_type_ph")}
              value={data.businessType}
              onChange={(e) => {
                u({ businessType: e.target.value });
                clearError("businessType");
              }}
              onBlur={(e) =>
                validateField("businessType", e.target.value, data)
              }
              error={errors.businessType}
              options={[
                { value: "manufacturing", label: t("s2_bt_mfg") },
                { value: "services", label: t("s2_bt_svc") },
                { value: "trading", label: t("s2_bt_trd") },
                { value: "agriculture", label: t("s2_bt_agr") },
                { value: "technology", label: t("s2_bt_tec") },
                { value: "other", label: t("s2_bt_oth") },
              ]}
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <ValidatedSelect
              label={t("s2_sector")}
              placeholder={t("s2_sector_ph")}
              value={data.sector}
              onChange={(e) => {
                u({ sector: e.target.value, sectorOther: "" });
                clearError("sector");
                clearError("sectorOther");
              }}
              onBlur={(e) => validateField("sector", e.target.value, data)}
              error={errors.sector}
              options={[
                { value: "agri", label: t("s2_sc_agri") },
                { value: "food", label: t("s2_sc_food") },
                { value: "tech", label: t("s2_sc_tech") },
                { value: "textile", label: t("s2_sc_text") },
                { value: "health", label: t("s2_sc_hlth") },
                { value: "education", label: t("s2_sc_edu") },
                { value: "construction", label: t("s2_sc_cons") },
                { value: "other", label: t("s2_sc_oth") },
              ]}
            />
            {data.sector === "other" && (
              <div style={{ marginTop: 8 }}>
                <input
                  style={{
                    ...inputStyle,
                    width: "100%",
                    boxSizing: "border-box",
                    border: `1.5px solid ${errors.sectorOther ? "#e53e3e" : "#ddd"}`,
                  }}
                  placeholder={t("s2_sector_other_ph")}
                  value={data.sectorOther}
                  onChange={(e) => {
                    u({ sectorOther: e.target.value });
                    clearError("sectorOther");
                  }}
                  onBlur={(e) =>
                    validateField("sectorOther", e.target.value, { ...data, sector: "other" })
                  }
                />
                {errors.sectorOther && (
                  <span style={{ fontSize: 11, color: "#e53e3e" }}>
                    ⚠ {errors.sectorOther}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Business Status */}
        <div>
          <label style={labelStyle}>{t("s2_status")}</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {statusOptions.map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `2px solid ${data.businessStatus === opt.value ? C.green : errors.businessStatus ? "#e53e3e" : "#ddd"}`,
                  background:
                    data.businessStatus === opt.value ? "#f0fff4" : "#fff",
                }}
              >
                <input
                  type="radio"
                  name="bizStatus"
                  value={opt.value}
                  checked={data.businessStatus === opt.value}
                  onChange={() => {
                    u({ businessStatus: opt.value });
                    clearError("businessStatus");
                  }}
                  style={{ accentColor: C.green, width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14 }}>{opt.label}</span>
              </label>
            ))}
          </div>
          {errors.businessStatus && (
            <span style={{ fontSize: 11, color: "#e53e3e" }}>
              ⚠ {errors.businessStatus}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <ValidatedInput
              label={t("s2_employ")}
              placeholder={t("s2_employ_ph")}
              value={data.employment}
              onChange={(e) => {
                u({ employment: e.target.value });
                clearError("employment");
              }}
              onBlur={(e) => validateField("employment", e.target.value, data)}
              error={errors.employment}
            />
            <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>
              {t("s2_employ_sub")}
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={labelStyle}>{t("s2_invest")}</label>
            <p style={{ fontSize: 11, color: "#888", margin: "0 0 5px" }}>
              {t("s2_invest_sub")}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, color: "#555" }}>₹</span>
              <div style={{ flex: 1 }}>
                <ValidatedInput
                  placeholder={t("s2_invest_ph")}
                  value={data.investment}
                  onChange={(e) => {
                    u({ investment: e.target.value });
                    clearError("investment");
                  }}
                  onBlur={(e) =>
                    validateField("investment", e.target.value, data)
                  }
                  error={errors.investment}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section2;
