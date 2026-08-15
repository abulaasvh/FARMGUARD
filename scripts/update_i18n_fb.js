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

const newTranslations = {
  // Farmer Sending Offer to Buyer
  "marketplace.send_offer_to_buyer": {
    en: "Send Crop Offer",
    hi: "फसल प्रस्ताव भेजें",
    ta: "பயிர் சலுகையை அனுப்பவும்",
    kn: "ಬೆಳೆ ಕೊಡುಗೆಯನ್ನು ಕಳುಹಿಸಿ",
    ml: "വിള ഓഫർ അയയ്ക്കുക",
    te: "పంట ఆఫర్‌ను పంపండి"
  },
  "marketplace.send_offer_desc": {
    en: "Propose a direct crop harvest offer to this verified buyer",
    hi: "इस सत्यापित खरीदार को सीधे फसल उपज का प्रस्ताव दें",
    ta: "இந்த சரிபார்க்கப்பட்ட வாங்குபவருக்கு நேரடி பயிர் சலுகையை முன்மொழியவும்",
    kn: "ಈ ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರಿಗೆ ನೇರ ಬೆಳೆ ಕೊಡುಗೆಯನ್ನು ಪ್ರಸ್ತಾಪಿಸಿ",
    ml: "ഈ സ്ഥിരീകരിച്ച വാങ്ങുന്നയാൾക്ക് നേരിട്ടുള്ള വിള ഓഫർ നിർദ്ദേശിക്കുക",
    te: "ఈ ధృవీకరించబడిన కొనుగోలుదారుకు ప్రత్యక్ష పంట ఆఫర్‌ను ప్రతిపాదించండి"
  },
  "marketplace.select_plot_or_crop": {
    en: "Select Farm Plot / Crop",
    hi: "खेत प्लॉट / फसल चुनें",
    ta: "பண்ணை நிலம் / பயிரைத் தேர்ந்தெடுக்கவும்",
    kn: "ಕೃಷಿ ಪ್ಲಾಟ್ / ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ",
    ml: "ഫാം പ്ലോട്ട് / വിള തിരഞ്ഞെടുക്കുക",
    te: "వ్యవసాయ ప్లాట్ / పంటను ఎంచుకోండి"
  },
  "marketplace.offer_sent_success": {
    en: "Crop offer sent to buyer successfully",
    hi: "खरीदार को फसल प्रस्ताव सफलतापूर्वक भेजा गया",
    ta: "வாங்குபவருக்கு பயிர் சலுகை வெற்றிகரமாக அனுப்பப்பட்டது",
    kn: "ಖರೀದಿದಾರರಿಗೆ ಬೆಳೆ ಕೊಡುಗೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ",
    ml: "വാങ്ങുന്നയാൾക്ക് വിള ഓഫർ വിജയകരമായി അയച്ചു",
    te: "కొనుగోలుదారుకు పంట ఆఫర్ విజయవంతంగా పంపబడింది"
  },
  "marketplace.offer_send_failed": {
    en: "Failed to send crop offer",
    hi: "फसल प्रस्ताव भेजने में विफल",
    ta: "பயிர் சலுகையை அனுப்ப முடியவில்லை",
    kn: "ಬೆಳೆ ಕೊಡುಗೆಯನ್ನು ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ",
    ml: "വിള ഓഫർ അയയ്ക്കുന്നതിൽ പരാജയപ്പെട്ടു",
    te: "పంట ఆఫర్‌ను పంపడంలో విఫలమైంది"
  },

  // Notification System
  "notifications.title": {
    en: "Notifications",
    hi: "सूचनाएं",
    ta: "அறிவிப்புகள்",
    kn: "ಅಧಿಸೂಚನೆಗಳು",
    ml: "അറിയിപ്പുകൾ",
    te: "నోటిఫికేషన్‌లు"
  },
  "notifications.no_notifications": {
    en: "No notifications yet",
    hi: "अभी तक कोई सूचना नहीं है",
    ta: "இன்னும் அறிவிப்புகள் இல்லை",
    kn: "ಇನ್ನೂ ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ",
    ml: "ഇതുവരെ അറിയിപ്പുകളൊന്നുമില്ല",
    te: "ఇంకా నోటిఫికేషన్‌లు లేవు"
  },
  "notifications.mark_all_read": {
    en: "Mark all as read",
    hi: "सभी को पढ़ा हुआ चिह्नित करें",
    ta: "அனைத்தையும் படித்ததாகக் குறிக்கவும்",
    kn: "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    ml: "എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക",
    te: "అన్నీ చదివినట్లుగా గుర్తించండి"
  },
  "notifications.clear_all": {
    en: "Clear all",
    hi: "सभी साफ़ करें",
    ta: "அனைத்தையும் அழிக்கவும்",
    kn: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ",
    ml: "എല്ലാം മായ്‌ക്കുക",
    te: "అన్నీ క్లియర్ చేయండి"
  },
  "notifications.new_offer_farmer": {
    en: "New purchase offer from {buyer} for {crop} (₹{price}/kg)",
    hi: "{buyer} से {crop} के लिए नया खरीद प्रस्ताव (₹{price}/किग्रा)",
    ta: "{crop} க்கான புதிய கொள்முதல் சலுகை {buyer} இடமிருந்து (₹{price}/கிலோ)",
    kn: "{buyer} ರಿಂದ {crop} ಗೆ ಹೊಸ ಖರೀದಿ ಕೊಡುಗೆ (₹{price}/ಕೆಜಿ)",
    ml: "{crop}-നായി {buyer}-ൽ നിന്ന് പുതിയ വാങ്ങൽ ഓഫർ (₹{price}/കിലോ)",
    te: "{buyer} నుండి {crop} కోసం కొత్త కొనుగోలు ఆఫర్ (₹{price}/కేజీ)"
  },
  "notifications.offer_accepted_buyer": {
    en: "Your offer for {crop} at {farm} was accepted by the farmer",
    hi: "{farm} में {crop} के लिए आपका प्रस्ताव किसान द्वारा स्वीकार कर लिया गया",
    ta: "{farm} இல் {crop} க்கான உங்கள் சலுகை விவசாயியால் ஏற்றுக்கொள்ளப்பட்டது",
    kn: "{farm} ನಲ್ಲಿ {crop} ಗಾಗಿ ನಿಮ್ಮ ಕೊಡುಗೆಯನ್ನು ರೈತರು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ",
    ml: "{farm}-ലെ {crop}-നായുള്ള നിങ്ങളുടെ ഓഫർ കർഷകൻ സ്വീകരിച്ചു",
    te: "{farm} వద్ద {crop} కోసం మీ ఆఫర్ రైతుచే అంగీకరించబడింది"
  },
  "notifications.offer_rejected_buyer": {
    en: "Your offer for {crop} at {farm} was declined",
    hi: "{farm} में {crop} के लिए आपका प्रस्ताव अस्वीकार कर दिया गया",
    ta: "{farm} இல் {crop} க்கான உங்கள் சலுகை நிராகரிக்கப்பட்டது",
    kn: "{farm} ನಲ್ಲಿ {crop} ಗಾಗಿ ನಿಮ್ಮ ಕೊಡುಗೆಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    ml: "{farm}-ലെ {crop}-നായുള്ള നിങ്ങളുടെ ഓഫർ നിരസിച്ചു",
    te: "{farm} వద్ద {crop} కోసం మీ ఆఫర్ తిరస్కరించబడింది"
  },
  "notifications.new_crop_offer_buyer": {
    en: "Farmer from {farm} sent a direct crop offer for {crop} (₹{price}/kg)",
    hi: "{farm} के किसान ने {crop} के लिए सीधा फसल प्रस्ताव भेजा (₹{price}/किग्रा)",
    ta: "{farm} விவசாயி {crop} க்கான நேரடி பயிர் சலுகையை அனுப்பினார் (₹{price}/கிலோ)",
    kn: "{farm} ನ ರೈತರು {crop} ಗೆ ನೇರ ಬೆಳೆ ಕೊಡುಗೆಯನ್ನು ಕಳುಹಿಸಿದ್ದಾರೆ (₹{price}/ಕೆಜಿ)",
    ml: "{farm}-ലെ കർഷകൻ {crop}-നായി നേരിട്ടുള്ള വിള ഓഫർ അയച്ചു (₹{price}/കിലോ)",
    te: "{farm} నుండి రైతు {crop} కోసం ప్రత్యక్ష పంట ఆఫర్‌ను పంపారు (₹{price}/కేజీ)"
  },

  // Contracts
  "contracts.no_contracts": {
    en: "No active procurement contracts",
    hi: "कोई सक्रिय खरीद अनुबंध नहीं है",
    ta: "செயலில் உள்ள கொள்முதல் ஒப்பந்தங்கள் இல்லை",
    kn: "ಯಾವುದೇ ಸಕ್ರಿಯ ಖರೀದಿ ಒಪ್ಪಂದಗಳಿಲ್ಲ",
    ml: "സജീവമായ സംഭരണ കരാറുകളൊന്നുമില്ല",
    te: "సక్రియ సేకరణ ఒప్పందాలు ఏవీ లేవు"
  },
  "contracts.no_contracts_desc": {
    en: "Contracts will automatically appear here once purchase offers are accepted by farmers.",
    hi: "किसानों द्वारा खरीद प्रस्ताव स्वीकार किए जाने पर अनुबंध यहाँ स्वतः दिखाई देंगे।",
    ta: "விவசாயிகளால் கொள்முதல் சலுகைகள் ஏற்றுக்கொள்ளப்பட்டதும் ஒப்பந்தங்கள் தானாகவே இங்கு தோன்றும்.",
    kn: "ರೈತರು ಖರೀದಿ ಕೊಡುಗೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿದ ನಂತರ ಒಪ್ಪಂದಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",
    ml: "കർഷകർ വാങ്ങൽ ഓഫറുകൾ സ്വീകരിച്ചുകഴിഞ്ഞാൽ കരാറുകൾ ഇവിടെ ദൃശ്യമാകും.",
    te: "రైతులు కొనుగోలు ఆఫర్లను అంగీకరించిన తర్వాత ఒప్పందాలు స్వయంచాలకంగా ఇక్కడ కనిపిస్తాయి."
  },
  "contracts.contract_id": {
    en: "Contract #{id}",
    hi: "अनुबंध #{id}",
    ta: "ஒப்பந்தம் #{id}",
    kn: "ಒಪ್ಪಂದ #{id}",
    ml: "കരാർ #{id}",
    te: "ఒప్పందం #{id}"
  },
  "contracts.value": {
    en: "Contract Value",
    hi: "अनुबंध मूल्य",
    ta: "ஒப்பந்த மதிப்பு",
    kn: "ಒಪ್ಪಂದದ ಮೌಲ್ಯ",
    ml: "കരാർ മൂല്യം",
    te: "ఒప్పంద విలువ"
  },
  "contracts.volume": {
    en: "Agreed Volume",
    hi: "सहमत मात्रा",
    ta: "ஒப்புக்கொள்ளப்பட்ட அளவு",
    kn: "ಒಪ್ಪಿದ ಪ್ರಮಾಣ",
    ml: "സമ്മതിച്ച അളവ്",
    te: "అంగీకరించిన పరిమాణం"
  },
  "contracts.status_active": {
    en: "Active Contract",
    hi: "सक्रिय अनुबंध",
    ta: "செயலில் உள்ள ஒப்பந்தம்",
    kn: "ಸಕ್ರಿಯ ಒಪ್ಪಂದ",
    ml: "സജീവ കരാർ",
    te: "సక్రియ ఒప్పందం"
  },
  "contracts.status_completed": {
    en: "Completed Contract",
    hi: "पूर्ण अनुबंध",
    ta: "நிறைவடைந்த ஒப்பந்தம்",
    kn: "ಪೂರ್ಣಗೊಂಡ ಒಪ್ಪಂದ",
    ml: "പൂർത്തിയായ കരാർ",
    te: "పూర్తయిన ఒప్పందం"
  },
  "buyer.no_procurement_records": {
    en: "No procurement requests or offers found",
    hi: "कोई खरीद अनुरोध या प्रस्ताव नहीं मिला",
    ta: "கொள்முதல் கோரிக்கைகள் அல்லது சலுகைகள் எதுவும் கிடைக்கவில்லை",
    kn: "ಯಾವುದೇ ಖರೀದಿ ವಿನಂತಿಗಳು ಅಥವಾ ಕೊಡುಗೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    ml: "സംഭരണ അഭ്യർത്ഥനകളോ ഓഫറുകളോ കണ്ടെത്തിയില്ല",
    te: "ఎలాంటి సేకరణ అభ్యర్థనలు లేదా ఆఫర్లు కనుగొనబడలేదు"
  },
  "buyer.no_procurement_desc": {
    en: "Submit purchase offers to available farms to start procurement.",
    hi: "खरीद शुरू करने के लिए उपलब्ध खेतों को खरीद प्रस्ताव भेजें।",
    ta: "கொள்முதலைத் தொடங்க கிடைக்கக்கூடிய பண்ணைகளுக்கு சலுகைகளை சமர்ப்பிக்கவும்.",
    kn: "ಖರೀದಿಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಲಭ್ಯವಿರುವ ಕೃಷಿಗಳಿಗೆ ಖರೀದಿ ಕೊಡುಗೆಗಳನ್ನು ಸಲ್ಲಿಸಿ.",
    ml: "സംഭരണം ആരംഭിക്കുന്നതിന് ലഭ്യമായ ഫാമുകളിലേക്ക് വാങ്ങൽ ഓഫറുകൾ സമർപ്പിക്കുക.",
    te: "సేకరణను ప్రారంభించడానికి అందుబాటులో ఉన్న పొలాలకు కొనుగోలు ఆఫర్లను సమర్పించండి."
  }
};

for (const [key, trans] of Object.entries(newTranslations)) {
  en[key] = trans.en;
  hi[key] = trans.hi;
  ta[key] = trans.ta;
  kn[key] = trans.kn;
  ml[key] = trans.ml;
  te[key] = trans.te;
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
console.log("Successfully rebuilt lib/i18n.tsx with complete farmer-buyer bidirectional & notification translations!");
