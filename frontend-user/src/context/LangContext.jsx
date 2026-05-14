import { createContext, useContext, useState } from "react";
import translations from "../constants/translations";

const LangContext = createContext({
  lang: "mr",
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }) {
  const [lang, setLang] = useState("mr");

  // ✅ Dynamic variables support: t("key", { email: "abc@xyz.com" })
  const t = (key, vars = {}) => {
    let str = translations[lang]?.[key] || key;
    Object.keys(vars).forEach((k) => {
      str = str.replace(new RegExp(`{{${k}}}`, "g"), vars[k]);
    });
    return str;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used inside <LangProvider>");
  return context;
}
