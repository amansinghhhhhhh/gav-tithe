import { createContext, useContext, useState } from "react";
import translations from "../constants/translations";

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("mr"); // default Marathi

  const t = (key) => translations[lang]?.[key] || key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

// Custom hook — kisi bhi component mein use karo
export function useLang() {
  return useContext(LangContext);
}
