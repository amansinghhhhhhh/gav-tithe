import { useEffect } from "react";
import SectionHeader from "../shared/SectionHeader";
import { useLang } from "../../context/LangContext";
import { RadioGroup } from "../shared/RadioGroup";
import Select from "../shared/Select";
import { inputStyle, labelStyle, sectionCardStyle } from "../shared/styles";
import useValidation from "../../hooks/useValidation";
import {
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "../shared/ValidatedInput";

const makeRules = (t) => ({
  hadLoan: (v) => (!v ? t("err_required") : null),
  cibilScore: (v) =>
    !v?.trim()
      ? t("err_required")
      : isNaN(Number(v))
        ? t("err_number")
        : Number(v) < 300 || Number(v) > 900
          ? t("err_cibil")
          : null,
});

function Section3({ data, dispatch, registerNext, onNext }) {
  const { t } = useLang();
  const u = (p) => dispatch({ type: "UPDATE_SECTION3", payload: p });
  const { errors, validateField, validateAll, clearError } = useValidation(
    makeRules(t),
  );

  const handleNext = () => {
    const isValid = validateAll({
      hadLoan: data.hadLoan,
      cibilScore: data.cibilScore,
    });
    if (isValid) onNext();
  };

  useEffect(() => {
    registerNext(handleNext);
  });

  return (
    <div style={sectionCardStyle}>
      <SectionHeader title={t("s3_title")} />

      <div
        style={{
          background: "#fff8e1",
          border: "1px solid #f0c040",
          borderRadius: 10,
          padding: "14px 16px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <p
          style={{ margin: 0, fontSize: 12, color: "#5a4000", lineHeight: 1.6 }}
        >
          {t("s3_info")}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>{t("s3_had_loan")}</label>
          <RadioGroup
            name="hadLoan"
            value={data.hadLoan}
            options={[
              { value: "hoy", label: t("s3_yes") },
              { value: "nahi", label: t("s3_no") },
            ]}
            onChange={(v) => {
              u({ hadLoan: v });
              clearError("hadLoan");
            }}
          />
          {errors.hadLoan && (
            <span style={{ fontSize: 11, color: "#e53e3e" }}>
              ⚠ {errors.hadLoan}
            </span>
          )}
        </div>

        {data.hadLoan === "hoy" && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <ValidatedSelect
                label={t("s3_loan_type")}
                placeholder={t("s3_lt_ph")}
                value={data.loanType}
                onChange={(e) => u({ loanType: e.target.value })}
                options={[
                  { value: "personal", label: t("s3_lt_per") },
                  { value: "business", label: t("s3_lt_biz") },
                  { value: "home", label: t("s3_lt_home") },
                  { value: "vehicle", label: t("s3_lt_veh") },
                  { value: "agriculture", label: t("s3_lt_agr") },
                  { value: "other", label: t("s3_lt_oth") },
                ]}
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <ValidatedSelect
                label={t("s3_repay")}
                placeholder={t("s3_rep_ph")}
                value={data.repaymentStatus}
                onChange={(e) => u({ repaymentStatus: e.target.value })}
                options={[
                  { value: "regular", label: t("s3_rep_reg") },
                  { value: "irregular", label: t("s3_rep_irr") },
                  { value: "settled", label: t("s3_rep_set") },
                  { value: "na", label: t("s3_rep_na") },
                ]}
              />
            </div>
          </div>
        )}

        <ValidatedInput
          label={t("s3_cibil")}
          placeholder={t("s3_cibil_ph")}
          value={data.cibilScore}
          onChange={(e) => {
            u({ cibilScore: e.target.value });
            clearError("cibilScore");
          }}
          onBlur={(e) => validateField("cibilScore", e.target.value, data)}
          error={errors.cibilScore}
        />

        <div>
          <ValidatedTextarea
            label={t("s3_difficulty")}
            placeholder={t("s3_diff_ph")}
            value={data.pastDifficulty}
            onChange={(e) => u({ pastDifficulty: e.target.value })}
          />
          <p style={{ fontSize: 11, color: "#888", margin: "4px 0 0" }}>
            {t("s3_diff_sub")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Section3;
