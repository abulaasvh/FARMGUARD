const fs = require('fs');
const path = require('path');

const oldI18n = fs.readFileSync(path.join(__dirname, '../lib/i18n.tsx'), 'utf-8');

function extractDict(code, dictName) {
  const match = code.match(new RegExp(`const ${dictName}: Dict = ({[\\s\\S]*?});`));
  if (match) {
    return JSON.parse(match[1]);
  }
  throw new Error(`Could not find ${dictName}`);
}

const en = extractDict(oldI18n, 'en');
const hi = extractDict(oldI18n, 'hi');
const ta = extractDict(oldI18n, 'ta');
const kn = extractDict(oldI18n, 'kn');
const ml = extractDict(oldI18n, 'ml');
const te = extractDict(oldI18n, 'te');

en["auth.confirm_password"] = "Confirm password";
hi["auth.confirm_password"] = "पासवर्ड की पुष्टि करें";
ta["auth.confirm_password"] = "கடவுச்சொல்லை உறுதிப்படுத்தவும்";
kn["auth.confirm_password"] = "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ";
ml["auth.confirm_password"] = "പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക";
te["auth.confirm_password"] = "పాస్‌వర్డ్‌ను నిర్ధారించండి";

en["auth.city_state_placeholder"] = "City, State";
hi["auth.city_state_placeholder"] = "शहर, राज्य";
ta["auth.city_state_placeholder"] = "நகரம், மாநிலம்";
kn["auth.city_state_placeholder"] = "ನಗರ, ರಾಜ್ಯ";
ml["auth.city_state_placeholder"] = "നഗരം, സംസ്ഥാനം";
te["auth.city_state_placeholder"] = "నగరం, రాష్ట్రం";

// Verify all keys
const allDicts = { hi, ta, kn, ml, te };
for (const [lang, d] of Object.entries(allDicts)) {
  for (const k of Object.keys(en)) {
    if (!d[k]) {
      console.error(`Missing in ${lang}: ${k}`);
    }
  }
}

const fileContent = `"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "@/constants";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "HI" },
  { code: "ta", label: "தமிழ்", short: "TA" },
  { code: "kn", label: "ಕನ್ನಡ", short: "KN" },
  { code: "ml", label: "മലയാളം", short: "ML" },
  { code: "te", label: "తెలుగు", short: "TE" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

export interface I18nValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const en: Dict = ${JSON.stringify(en, null, 2)};

const hi: Dict = ${JSON.stringify(hi, null, 2)};

const ta: Dict = ${JSON.stringify(ta, null, 2)};

const kn: Dict = ${JSON.stringify(kn, null, 2)};

const ml: Dict = ${JSON.stringify(ml, null, 2)};

const te: Dict = ${JSON.stringify(te, null, 2)};

export const catalogue: Record<LanguageCode, Dict> = {
  en,
  hi,
  ta,
  kn,
  ml,
  te,
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.language) as LanguageCode | null;
    if (stored && stored in catalogue) {
      setLanguageState(stored);
      return;
    }

    const sessStr = window.localStorage.getItem(STORAGE_KEYS.session);
    if (sessStr) {
      try {
        const sess = JSON.parse(sessStr);
        if (sess?.preferredLanguage && sess.preferredLanguage in catalogue) {
          setLanguageState(sess.preferredLanguage as LanguageCode);
        }
      } catch (err) {
        console.error("Failed to parse session language:", err);
      }
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage: (code: LanguageCode) => {
        setLanguageState(code);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEYS.language, code);
          const sessStr = window.localStorage.getItem(STORAGE_KEYS.session);
          if (sessStr) {
            try {
              const sess = JSON.parse(sessStr);
              sess.preferredLanguage = code;
              window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sess));
            } catch (err) {
              console.error("Failed to update session language:", err);
            }
          }
        }
      },
      t: (key: string, params?: Record<string, string | number>) => {
        if (!key) return "";
        let translated = catalogue[language]?.[key];
        if (translated === undefined) {
          if (process.env.NODE_ENV === "development" && language !== "en") {
            console.warn(\`[i18n] Missing translation: \${language}.\${key}\`);
          }
          translated = en[key];
        }
        if (translated === undefined) {
          translated = key;
        }
        if (params) {
          Object.entries(params).forEach(([pK, pV]) => {
            translated = translated.replace(new RegExp(\`\\\\{\${pK}\\\\}\`, "g"), String(pV));
          });
        }
        return translated;
      },
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
`;

fs.writeFileSync(path.join(__dirname, '../lib/i18n.tsx'), fileContent);
console.log("Rebuilt lib/i18n.tsx with confirm password keys!");
