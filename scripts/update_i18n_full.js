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
  // Buyer Section / Marketplace
  "marketplace.buyer_section_title": {
    en: "Buyer Connections",
    hi: "खरीदार संपर्क",
    ta: "வாங்குபவர் தொடர்புகள்",
    kn: "ಖರೀದಿದಾರರ ಸಂಪರ್ಕಗಳು",
    ml: "വാങ്ങുന്നവരുടെ കണക്ഷനുകൾ",
    te: "కొనుగోలుదారుల అనుసంధానాలు"
  },
  "marketplace.buyer_section_subtitle": {
    en: "View buyers interested in purchasing your crops and manage incoming purchase offers",
    hi: "अपनी फसलों को खरीदने में रुचि रखने वाले खरीदारों को देखें और आने वाले खरीद प्रस्तावों का प्रबंधन करें",
    ta: "உங்கள் பயிர்களை வாங்க விரும்பும் வாங்குபவர்களைக் கண்டு வரும் கொள்முதல் சலுகைகளை நிர்வகிக்கவும்",
    kn: "ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಖರೀದಿಸಲು ಆಸಕ್ತಿ ಹೊಂದಿರುವ ಖರೀದಿದಾರರನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಬರುವ ಖರೀದಿ ಕೊಡುಗೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    ml: "നിങ്ങളുടെ വിളകൾ വാങ്ങാൻ താല്പര്യമുള്ള വാങ്ങുന്നവരെ കാണുകയും വരുന്ന വാങ്ങൽ ഓഫറുകൾ നിയന്ത്രിക്കുകയും ചെയ്യുക",
    te: "మీ పంటలను కొనుగోలు చేయడానికి ఆసక్తి ఉన్న కొనుగోలుదారులను వీక్షించండి మరియు వచ్చే కొనుగోలు ఆఫర్లను నిర్వహించండి"
  },
  "marketplace.incoming_offers": {
    en: "Incoming Purchase Offers",
    hi: "आने वाले खरीद प्रस्ताव",
    ta: "வரும் கொள்முதல் சலுகைகள்",
    kn: "ಬರುವ ಖರೀದಿ ಕೊಡುಗೆಗಳು",
    ml: "വരുന്ന വാങ്ങൽ ഓഫറുകൾ",
    te: "వచ్చే కొనుగోలు ఆఫర్లు"
  },
  "marketplace.incoming_offers_desc": {
    en: "Direct purchase offers submitted by verified buyers for your farm harvest",
    hi: "आपके खेत की उपज के लिए सत्यापित खरीदारों द्वारा प्रस्तुत सीधे खरीद प्रस्ताव",
    ta: "உங்கள் பண்ணை விளைச்சலுக்கு சரிபார்க்கப்பட்ட வாங்குபவர்களால் சமர்ப்பிக்கப்பட்ட நேரடி கொள்முதல் சலுகைகள்",
    kn: "ನಿಮ್ಮ ಕೃಷಿ ಇಳುವರಿಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರು ಸಲ್ಲಿಸಿದ ನೇರ ಖರೀದಿ ಕೊಡುಗೆಗಳು",
    ml: "നിങ്ങളുടെ കാർഷിക വിളവെടുപ്പിനായി സ്ഥിരീകരിച്ച വാങ്ങുന്നവർ സമർപ്പിച്ച നേരിട്ടുള്ള വാങ്ങൽ ഓഫറുകൾ",
    te: "మీ వ్యవసాయ దిగుబడి కోసం ధృవీకరించబడిన కొనుగోలుదారులు సమర్పించిన ప్రత్యక్ష కొనుగోలు ఆఫర్లు"
  },
  "marketplace.no_offers": {
    en: "No purchase offers received yet",
    hi: "अभी तक कोई खरीद प्रस्ताव प्राप्त नहीं हुआ",
    ta: "இதுவரை எந்த கொள்முதல் சலுகையும் பெறப்படவில்லை",
    kn: "ಇನ್ನೂ ಯಾವುದೇ ಖರೀದಿ ಕೊಡುಗೆಗಳು ಸ್ವೀಕರಿಸಲಾಗಿಲ್ಲ",
    ml: "ഇതുവരെ വാങ്ങൽ ഓഫറുകളൊന്നും ലഭിച്ചിട്ടില്ല",
    te: "ఇంకా ఎలాంటి కొనుగోలు ఆఫర్లు అందలేదు"
  },
  "marketplace.no_offers_desc": {
    en: "When verified buyers submit purchase offers for your crops, they will appear here with price and quantity details.",
    hi: "जब सत्यापित खरीदार आपकी फसलों के लिए खरीद प्रस्ताव भेजेंगे, तो वे मूल्य और मात्रा विवरण के साथ यहाँ दिखाई देंगे।",
    ta: "சரிபார்க்கப்பட்ட வாங்குபவர்கள் உங்கள் பயிர்களுக்கு கொள்முதல் சலுகைகளை சமர்ப்பிக்கும் போது, அவை விலை மற்றும் அளவு விவரங்களுடன் இங்கு தோன்றும்.",
    kn: "ಪರಿಶೀಲಿಸಿದ ಖರೀದಿದಾರರು ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಖರೀದಿ ಕೊಡುಗೆಗಳನ್ನು ಸಲ್ಲಿಸಿದಾಗ, ಅವು ಬೆಲೆ ಮತ್ತು ಪ್ರಮಾಣದ ವಿವರಗಳೊಂದಿಗೆ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",
    ml: "സ്ഥിരീകരിച്ച വാങ്ങുന്നവർ നിങ്ങളുടെ വിളകൾക്കായി വാങ്ങൽ ഓഫറുകൾ സമർപ്പിക്കുമ്പോൾ, അവ വിലയും അളവും വിവരങ്ങളോടെ ഇവിടെ ദൃശ്യമാകും.",
    te: "ధృవీకరించబడిన కొనుగోలుదారులు మీ పంటల కోసం కొనుగోలు ఆఫర్లను సమర్పించినప్పుడు, అవి ధర మరియు పరిమాణం వివరాలతో ఇక్కడ కనిపిస్తాయి."
  },
  "marketplace.interested_buyers": {
    en: "Interested Buyers Directory",
    hi: "इच्छुक खरीदार निर्देशिका",
    ta: "ஆர்வமுள்ள வாங்குபவர்கள் அடைவு",
    kn: "ಆಸಕ್ತ ಖರೀದಿದಾರರ ಡೈರೆಕ್ಟರಿ",
    ml: "താല്പര്യമുള്ള വാങ്ങുന്നവരുടെ ഡയറക്ടറി",
    te: "ఆసక్తిగల కొనుగోలుదారుల డైరెక్టరీ"
  },
  "marketplace.interested_buyers_desc": {
    en: "Verified agricultural buyers and procurement companies looking for crops you grow",
    hi: "सत्यापित कृषि खरीदार और खरीद कंपनियाँ जो आपकी उगाई गई फसलों की तलाश में हैं",
    ta: "நீங்கள் பயிரிடும் பயிர்களைத் தேடும் சரிபார்க்கப்பட்ட விவசாய வாங்குபவர்கள் மற்றும் கொள்முதல் நிறுவனங்கள்",
    kn: "ನೀವು ಬೆಳೆಯುವ ಬೆಳೆಗಳನ್ನು ಹುಡುಕುತ್ತಿರುವ ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ಖರೀದಿದಾರರು ಮತ್ತು ಖರೀದಿ ಕಂಪನಿಗಳು",
    ml: "നിങ്ങൾ കൃഷി ചെയ്യുന്ന വിളകൾക്കായി തിരയുന്ന സ്ഥിരീകരിച്ച കാർഷിക വാങ്ങുന്നവരും സംഭരണ കമ്പനികളും",
    te: "మీరు పండించే పంటల కోసం చూస్తున్న ధృవీకరించబడిన వ్యవసాయ కొనుగోలుదారులు మరియు సేకరణ కంపెనీలు"
  },
  "marketplace.no_buyers": {
    en: "No buyers registered yet",
    hi: "अभी तक कोई खरीदार पंजीकृत नहीं है",
    ta: "இதுவரை எந்த வாங்குபவரும் பதிவு செய்யப்படவில்லை",
    kn: "ಇನ್ನೂ ಯಾವುದೇ ಖರೀದಿದಾರರು ನೋಂದಾಯಿಸಿಲ್ಲ",
    ml: "ഇതുവരെ വാങ്ങുന്നവരൊന്നും രജിസ്റ്റർ ചെയ്തിട്ടില്ല",
    te: "ఇంకా కొనుగోలుదారులు నమోదు కాలేదు"
  },
  "marketplace.buyer_name": {
    en: "Buyer Name",
    hi: "खरीदार का नाम",
    ta: "வாங்குபவர் பெயர்",
    kn: "ಖರೀದಿದಾರರ ಹೆಸರು",
    ml: "വാങ്ങുന്നയാളുടെ പേര്",
    te: "కొనుగోలుదారు పేరు"
  },
  "marketplace.company_name": {
    en: "Company",
    hi: "कंपनी",
    ta: "நிறுவனம்",
    kn: "ಕಂಪನಿ",
    ml: "കമ്പനി",
    te: "కంపెనీ"
  },
  "marketplace.business_type": {
    en: "Business Type",
    hi: "व्यवसाय प्रकार",
    ta: "வணிக வகை",
    kn: "ವ್ಯಾಪಾರ ಪ್ರಕಾರ",
    ml: "ബിസിനസ്സ് തരം",
    te: "వ్యాపార రకం"
  },
  "marketplace.interested_crops": {
    en: "Interested Crops",
    hi: "रुचि वाली फसलें",
    ta: "ஆர்வமுள்ள பயிர்கள்",
    kn: "ಆಸಕ್ತ ಬೆಳೆಗಳು",
    ml: "താല്പര്യമുള്ള വിളകൾ",
    te: "ఆసక్తిగల పంటలు"
  },
  "marketplace.location": {
    en: "Location",
    hi: "स्थान",
    ta: "இடம்",
    kn: "ಸ್ಥಳ",
    ml: "സ്ഥലം",
    te: "ప్రాంతం"
  },
  "marketplace.offered_price": {
    en: "Offered Price",
    hi: "प्रस्तावित मूल्य",
    ta: "வழங்கப்பட்ட விலை",
    kn: "ನೀಡಿದ ಬೆಲೆ",
    ml: "വാഗ്ദാനം ചെയ്ത വില",
    te: "ప్రతిపాదిత ధర"
  },
  "marketplace.quantity": {
    en: "Quantity",
    hi: "मात्रा",
    ta: "அளவு",
    kn: "ಪ್ರಮಾಣ",
    ml: "അളവ്",
    te: "పరిమాణం"
  },
  "marketplace.total_value": {
    en: "Total Value",
    hi: "कुल मूल्य",
    ta: "மொத்த மதிப்பு",
    kn: "ಒಟ್ಟು ಮೌಲ್ಯ",
    ml: "ആകെ മൂല്യം",
    te: "మొత్తం విలువ"
  },
  "marketplace.request_date": {
    en: "Offer Date",
    hi: "प्रस्ताव तिथि",
    ta: "சலுகை தேதி",
    kn: "ಕೊಡುಗೆ ದಿನಾಂಕ",
    ml: "ഓഫർ തീയതി",
    te: "ఆఫర్ తేదీ"
  },
  "marketplace.offer_status": {
    en: "Offer Status",
    hi: "प्रस्ताव स्थिति",
    ta: "சலுகை நிலை",
    kn: "ಕೊಡುಗೆ ಸ್ಥಿತಿ",
    ml: "ഓഫർ നില",
    te: "ఆఫర్ స్థితి"
  },
  "marketplace.accept_offer": {
    en: "Accept Offer",
    hi: "प्रस्ताव स्वीकार करें",
    ta: "சலுகையை ஏற்கவும்",
    kn: "ಕೊಡುಗೆಯನ್ನು ಸ್ವೀಕರಿಸಿ",
    ml: "ഓഫർ സ്വീകരിക്കുക",
    te: "ఆఫర్‌ను అంగీకరించండి"
  },
  "marketplace.reject_offer": {
    en: "Reject Offer",
    hi: "प्रस्ताव अस्वीकार करें",
    ta: "சலுகையை நிராகரிக்கவும்",
    kn: "ಕೊಡುಗೆಯನ್ನು ತಿರಸ್ಕರಿಸಿ",
    ml: "ഓഫർ നിരസിക്കുക",
    te: "ఆఫర్‌ను తిరస్కరించండి"
  },
  "marketplace.offer_accepted": {
    en: "Offer accepted successfully",
    hi: "प्रस्ताव सफलतापूर्वक स्वीकार कर लिया गया",
    ta: "சலுகை வெற்றிகரமாக ஏற்றுக்கொள்ளப்பட்டது",
    kn: "ಕೊಡುಗೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    ml: "ഓഫർ വിജയകരമായി സ്വീകരിച്ചു",
    te: "ఆఫర్ విజయవంతంగా అంగీకరించబడింది"
  },
  "marketplace.offer_rejected": {
    en: "Offer rejected",
    hi: "प्रस्ताव अस्वीकार कर दिया गया",
    ta: "சலுகை நிராகரிக்கப்பட்டது",
    kn: "ಕೊಡುಗೆಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    ml: "ഓഫർ നിരസിച്ചു",
    te: "ఆఫర్ తిరస్కరించబడింది"
  },
  "marketplace.action_failed": {
    en: "Failed to update offer status",
    hi: "प्रस्ताव स्थिति अपडेट करने में विफल",
    ta: "சலுகை நிலையைப் புதுப்பிக்க முடியவில்லை",
    kn: "ಕೊಡುಗೆ ಸ್ಥಿತಿಯನ್ನು ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ",
    ml: "ഓഫർ നില അപ്ഡേറ്റ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു",
    te: "ఆఫర్ స్థితిని నవీకరించడంలో విఫలమైంది"
  },
  "marketplace.price_per_kg": {
    en: "₹{price} / kg",
    hi: "₹{price} / किग्रा",
    ta: "₹{price} / கிலோ",
    kn: "₹{price} / ಕೆಜಿ",
    ml: "₹{price} / കിലോ",
    te: "₹{price} / కేజీ"
  },
  "marketplace.price_per_quintal": {
    en: "₹{price} / quintal",
    hi: "₹{price} / क्विंटल",
    ta: "₹{price} / குவிண்டால்",
    kn: "₹{price} / ಕ್ವಿಂಟಾಲ್",
    ml: "₹{price} / ക്വിന്റൽ",
    te: "₹{price} / క్వింటాల్"
  },
  "marketplace.buyer_contact_notice": {
    en: "Buyer details and contact coordination are established once the offer is accepted.",
    hi: "प्रस्ताव स्वीकार होने के बाद खरीदार विवरण और संपर्क स्थापित किया जाता है।",
    ta: "சலுகை ஏற்றுக்கொள்ளப்பட்டதும் வாங்குபவரின் விவரங்கள் மற்றும் தொடர்பு ஒருங்கிணைப்பு நிறுவப்படும்.",
    kn: "ಕೊಡುಗೆಯನ್ನು ಸ್ವೀಕರಿಸಿದ ನಂತರ ಖರೀದಿದಾರರ ವಿವರಗಳು ಮತ್ತು ಸಂಪರ್ಕ ಸಮನ್ವಯವನ್ನು ಸ್ಥಾಪಿಸಲಾಗುತ್ತದೆ.",
    ml: "ഓഫർ സ്വീകരിച്ചുകഴിഞ്ഞാൽ വാങ്ങുന്നയാളുടെ വിവരങ്ങളും കോൺടാക്റ്റ് ഏകോപനവും സ്ഥാപിക്കപ്പെടുന്നു.",
    te: "ఆఫర్ అంగీకరించిన తర్వాత కొనుగోలుదారు వివరాలు మరియు సంప్రదింపు సమన్వయం స్థాపించబడుతుంది."
  },
  "marketplace.status_pending": {
    en: "Pending",
    hi: "लंबित",
    ta: "நிலுவையில் உள்ளது",
    kn: "ಬಾಕಿ ಉಳಿದಿದೆ",
    ml: "തീർപ്പുകൽപ്പിക്കാത്തത്",
    te: "పెండింగ్‌లో ఉంది"
  },
  "marketplace.status_accepted": {
    en: "Accepted",
    hi: "स्वीकृत",
    ta: "ஏற்றுக்கொள்ளப்பட்டது",
    kn: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    ml: "സ്വീകരിച്ചു",
    te: "అంగీకరించబడింది"
  },
  "marketplace.status_rejected": {
    en: "Rejected",
    hi: "अस्वीकृत",
    ta: "நிராகரிக்கப்பட்டது",
    kn: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    ml: "നിരസിച്ചു",
    te: "తిరస్కరించబడింది"
  },
  "marketplace.status_completed": {
    en: "Completed",
    hi: "पूर्ण",
    ta: "நிறைவடைந்தது",
    kn: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    ml: "പൂർത്തിയായി",
    te: "పూర్తయింది"
  },
  "marketplace.buyer_interest": {
    en: "Buyer Interest & Requests",
    hi: "खरीदार रुचि और अनुरोध",
    ta: "வாங்குபவர் ஆர்வம் மற்றும் கோரிக்கைகள்",
    kn: "ಖರೀದಿದಾರರ ಆಸಕ್ತಿ ಮತ್ತು ವಿನಂತಿಗಳು",
    ml: "വാങ്ങുന്നയാളുടെ താല്പര്യവും അഭ്യർത്ഥനകളും",
    te: "కొనుగోలుదారు ఆసక్తి మరియు అభ్యర్థనలు"
  },
  "marketplace.quantity_tonnes": {
    en: "{crop} · {tonnes} Tonnes",
    hi: "{crop} · {tonnes} टन",
    ta: "{crop} · {tonnes} டன்கள்",
    kn: "{crop} · {tonnes} ಟನ್‌ಗಳು",
    ml: "{crop} · {tonnes} ടൺ",
    te: "{crop} · {tonnes} టన్నులు"
  },
  "marketplace.requested_on": {
    en: "Requested {date} by {buyer}",
    hi: "{buyer} द्वारा {date} को अनुरोधित",
    ta: "{buyer} ஆல் {date} அன்று கோரப்பட்டது",
    kn: "{buyer} ರವರಿಂದ {date} ರಂದು ವಿನಂತಿಸಲಾಗಿದೆ",
    ml: "{buyer} {date}-ൽ അഭ്യർത്ഥിച്ചു",
    te: "{buyer} ద్వారా {date}న అభ్యర్థించబడింది"
  },

  // Irrigation Page
  "irrigation.pump_control": {
    en: "Pump Control",
    hi: "पंप नियंत्रण",
    ta: "பம்ப் கட்டுப்பாடு",
    kn: "ಪಂಪ್ ನಿಯಂತ್ರಣ",
    ml: "പമ്പ് നിയന്ത്രണം",
    te: "పంప్ నియంత్రణ"
  },
  "irrigation.valve_control": {
    en: "Valve Control",
    hi: "वाल्व नियंत्रण",
    ta: "வால்வு கட்டுப்பாடு",
    kn: "ವಾಲ್ವ್ ನಿಯಂತ್ರಣ",
    ml: "വാൽവ് നിയന്ത്രണം",
    te: "వాల్వ్ నియంత్రణ"
  },
  "irrigation.turn_on": {
    en: "Turn Pump ON",
    hi: "पंप चालू करें",
    ta: "பம்ப் இயக்கவும்",
    kn: "ಪಂಪ್ ಆನ್ ಮಾಡಿ",
    ml: "പമ്പ് ഓൺ ചെയ്യുക",
    te: "పంప్ ఆన్ చేయండి"
  },
  "irrigation.turn_off": {
    en: "Turn Pump OFF",
    hi: "पंप बंद करें",
    ta: "பம்ப் நிறுத்தவும்",
    kn: "ಪಂಪ್ ಆಫ್ ಮಾಡಿ",
    ml: "പമ്പ് ഓഫ് ചെയ്യുക",
    te: "పంప్ ఆఫ్ చేయండి"
  },
  "irrigation.open_valve": {
    en: "Open Valve",
    hi: "वाल्व खोलें",
    ta: "வால்வை திறக்கவும்",
    kn: "ವಾಲ್ವ್ ತೆರೆಯಿರಿ",
    ml: "വാൽവ് തുറക്കുക",
    te: "వాల్వ్ తెరవండి"
  },
  "irrigation.close_valve": {
    en: "Close Valve",
    hi: "वाल्व बंद करें",
    ta: "வால்வை மூடவும்",
    kn: "ವಾಲ್ವ್ ಮುಚ್ಚಿರಿ",
    ml: "വാൽവ് അടയ്ക്കുക",
    te: "వాల్వ్ మూసివేయండి"
  },
  "irrigation.current_soil_moisture": {
    en: "Current Soil Moisture",
    hi: "वर्तमान मिट्टी की नमी",
    ta: "தற்போதைய மண் ஈரப்பதம்",
    kn: "ಪ್ರಸ್ತುತ ಮಣ್ಣಿನ ತೇವಾಂಶ",
    ml: "നിലവിലെ മണ്ണിലെ ഈർപ്പം",
    te: "ప్రస్తుత నేల తేమ"
  },
  "irrigation.rain_status": {
    en: "Rain Condition",
    hi: "बारिश की स्थिति",
    ta: "மழை நிலை",
    kn: "ಮಳೆಯ ಸ್ಥಿತಿ",
    ml: "മഴയുടെ അവസ്ഥ",
    te: "వర్షం పరిస్థితి"
  },
  "irrigation.rain_detected": {
    en: "Rain Detected (Irrigation Paused)",
    hi: "बारिश का पता चला (सिंचाई रुकी हुई)",
    ta: "மழை கண்டறியப்பட்டது (நீர்ப்பாசனம் இடைநிறுத்தப்பட்டது)",
    kn: "ಮಳೆ ಪತ್ತೆಯಾಗಿದೆ (ನೀರಾವರಿ ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ)",
    ml: "മഴ കണ്ടെത്തി (നനയ്ക്കൽ നിർത്തിവച്ചു)",
    te: "వర్షం గుర్తించబడింది (నీటిపారుదల నిలిపివేయబడింది)"
  },
  "irrigation.no_rain": {
    en: "No Rain Detected",
    hi: "बारिश नहीं है",
    ta: "மழை இல்லை",
    kn: "ಮಳೆ ಇಲ್ಲ",
    ml: "മഴയില്ല",
    te: "వర్షం లేదు"
  },
  "irrigation.device_status": {
    en: "Hardware Device Status",
    hi: "हार्डवेयर डिवाइस स्थिति",
    ta: "வன்பொருள் சாதனம் நிலை",
    kn: "ಯಂತ್ರಾಂಶ ಸಾಧನದ ಸ್ಥಿತಿ",
    ml: "ഹാർഡ്‌വെയർ ഉപകരണ നില",
    te: "హార్డ్‌వేర్ పరికర స్థితి"
  },
  "irrigation.command_status": {
    en: "Command State",
    hi: "कमांड स्थिति",
    ta: "கட்டளை நிலை",
    kn: "ಆಜ್ಞೆಯ ಸ್ಥಿತಿ",
    ml: "കമാൻഡ് നില",
    te: "కమాండ్ స్థితి"
  },
  "irrigation.active_mode": {
    en: "Control Mode",
    hi: "नियंत्रण मोड",
    ta: "கட்டுப்பாட்டு முறை",
    kn: "ನಿಯಂತ್ರಣ ಮೋಡ್",
    ml: "നിയന്ത്രണ മോഡ്",
    te: "నియంత్రణ మోడ్"
  },
  "irrigation.manual_mode": {
    en: "Manual Control",
    hi: "मैनुअल नियंत्रण",
    ta: "கையேடு கட்டுப்பாடு",
    kn: "ಹಸ್ತಚಾಲಿತ ನಿಯಂತ್ರಣ",
    ml: "മാനുവൽ നിയന്ത്രണം",
    te: "మాన్యువల్ నియంత్రణ"
  },
  "irrigation.auto_mode": {
    en: "Automated Control",
    hi: "स्वचालित नियंत्रण",
    ta: "தானியங்கி கட்டுப்பாடு",
    kn: "ಸ್ವಯಂಚಾಲಿತ ನಿಯಂತ್ರಣ",
    ml: "ഓട്ടോമേറ്റഡ് നിയന്ത്രണം",
    te: "ఆటోమేటెడ్ నియంత్రణ"
  },
  "irrigation.history_title": {
    en: "Irrigation Cycle History",
    hi: "सिंचाई चक्र इतिहास",
    ta: "நீர்ப்பாசன சுழற்சி வரலாறு",
    kn: "ನೀರಾವರಿ ಚಕ್ರದ ಇತಿಹಾಸ",
    ml: "നനയ്ക്കൽ ചക്രത്തിന്റെ ചരിത്രം",
    te: "నీటిపారుదల చక్రం చరిత్ర"
  },
  "irrigation.history_desc": {
    en: "Log of actual irrigation runs executed and recorded in the database",
    hi: "डेटाबेस में निष्पादित और रिकॉर्ड किए गए वास्तविक सिंचाई चक्रों का लॉग",
    ta: "தரவுத்தளத்தில் செயல்படுத்தப்பட்டு பதிவுசெய்யப்பட்ட உண்மையான நீர்ப்பாசன சுழற்சிகளின் பதிவு",
    kn: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಕಾರ್ಯಗತಗೊಳಿಸಲಾದ ಮತ್ತು ದಾಖಲಿಸಲಾದ ನೈಜ ನೀರಾವರಿ ಚಕ್ರಗಳ ಲಾಗ್",
    ml: "ഡാറ്റാബേസിൽ നടപ്പിലാക്കുകയും രേഖപ്പെടുത്തുകയും ചെയ്ത യഥാർത്ഥ നനയ്ക്കൽ റണ്ണുകളുടെ ലോഗ്",
    te: "డేటాబేస్‌లో అమలు చేయబడిన మరియు నమోదు చేయబడిన వాస్తవ నీటిపారుదల రన్‌ల లాగ్"
  },
  "irrigation.no_history": {
    en: "No irrigation cycles recorded yet",
    hi: "अभी तक कोई सिंचाई चक्र रिकॉर्ड नहीं किया गया है",
    ta: "இதுவரை நீர்ப்பாசன சுழற்சிகள் எதுவும் பதிவு செய்யப்படவில்லை",
    kn: "ಇನ್ನೂ ಯಾವುದೇ ನೀರಾವರಿ ಚಕ್ರಗಳು ದಾಖಲಾಗಿಲ್ಲ",
    ml: "ഇതുവരെ നനയ്ക്കൽ ചക്രങ്ങളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല",
    te: "ఇంకా నీటిపారుదల చక్రాలు నమోదు కాలేదు"
  },
  "irrigation.table_time": {
    en: "Started At",
    hi: "शुरू होने का समय",
    ta: "தொடங்கிய நேரம்",
    kn: "ಪ್ರಾರಂಭವಾದ ಸಮಯ",
    ml: "ആരംഭിച്ച സമയം",
    te: "ప్రారంభ సమయం"
  },
  "irrigation.table_duration": {
    en: "Duration",
    hi: "अवधि",
    ta: "கால அளவு",
    kn: "ಅವಧಿ",
    ml: "ദൈർഘ്യം",
    te: "వ్యవధి"
  },
  "irrigation.table_volume": {
    en: "Water Volume",
    hi: "पानी की मात्रा",
    ta: "நீரின் அளவு",
    kn: "ನೀರಿನ ಪ್ರಮಾಣ",
    ml: "ജലത്തിന്റെ അളവ്",
    te: "నీటి పరిమాణం"
  },
  "irrigation.table_source": {
    en: "Source",
    hi: "स्रोत",
    ta: "மூலம்",
    kn: "ಮೂಲ",
    ml: "ഉറവിടം",
    te: "మూలం"
  },
  "irrigation.table_result": {
    en: "Result",
    hi: "परिणाम",
    ta: "முடிவு",
    kn: "ಫಲಿತಾಂಶ",
    ml: "ഫലം",
    te: "ఫలితం"
  },
  "irrigation.table_plot": {
    en: "Plot / Zone",
    hi: "प्लॉट / ज़ोन",
    ta: "நிலம் / மண்டலம்",
    kn: "ಪ್ಲಾಟ್ / ವಲಯ",
    ml: "പ്ലോട്ട് / സോൺ",
    te: "ప్లాట్ / జోన్"
  },
  "irrigation.duration_mins": {
    en: "{mins} min",
    hi: "{mins} मिनट",
    ta: "{mins} நிமிடம்",
    kn: "{mins} ನಿಮಿಷ",
    ml: "{mins} മിനിറ്റ്",
    te: "{mins} నిమిషం"
  },
  "irrigation.volume_liters": {
    en: "{liters} L",
    hi: "{liters} ली",
    ta: "{liters} லி",
    kn: "{liters} ಲೀ",
    ml: "{liters} ലി",
    te: "{liters} లీ"
  },
  "irrigation.hardware_notice": {
    en: "Commands are dispatched directly to the ESP32 edge controller via Supabase realtime.",
    hi: "कमांड सीधे सुपबेस रीयलटाइम के माध्यम से ईएसपी32 एज कंट्रोलर को भेजे जाते हैं।",
    ta: "கட்டளைகள் சுபாபேஸ் நிகழ்நேரம் வழியாக நேரடியாக இஎஸ்பி32 கன்ட்ரோலருக்கு அனுப்பப்படுகின்றன.",
    kn: "ಆಜ್ಞೆಗಳನ್ನು ಸುಪಾಬೇಸ್ ನೈಜಸಮಯದ ಮೂಲಕ ನೇರವಾಗಿ ಇಎಸ್‌ಪಿ32 ನಿಯಂತ್ರಕಕ್ಕೆ ರವಾನಿಸಲಾಗುತ್ತದೆ.",
    ml: "കമാൻഡുകൾ സുപാബേസ് തത്സമയം വഴി നേരിട്ട് ഇഎസ്പി32 കൺട്രോളറിലേക്ക് അയയ്ക്കുന്നു.",
    te: "కమాండ్‌లు సుపాబేస్ రియల్‌టైమ్ ద్వారా నేరుగా ఈఎస్‌పీ32 కంట్రోలర్‌కు పంపబడతాయి."
  },

  // Analytics Page
  "analytics.range_today": {
    en: "Today",
    hi: "आज",
    ta: "இன்று",
    kn: "ಇಂದು",
    ml: "ഇന്ന്",
    te: "ఈరోజు"
  },
  "analytics.range_7d": {
    en: "7 Days",
    hi: "7 दिन",
    ta: "7 நாட்கள்",
    kn: "7 ದಿನಗಳು",
    ml: "7 ദിവസങ്ങൾ",
    te: "7 రోజులు"
  },
  "analytics.range_30d": {
    en: "30 Days",
    hi: "30 दिन",
    ta: "30 நாட்கள்",
    kn: "30 ದಿನಗಳು",
    ml: "30 ദിവസങ്ങൾ",
    te: "30 రోజులు"
  },
  "analytics.range_all": {
    en: "All Time",
    hi: "सभी समय",
    ta: "எல்லா நேரமும்",
    kn: "ಸಾರ್ವಕಾಲಿಕ",
    ml: "എല്ലാ സമയത്തും",
    te: "అన్ని సమయాలలో"
  },
  "analytics.avg_moisture": {
    en: "Average Soil Moisture",
    hi: "औसत मिट्टी की नमी",
    ta: "சராசரி மண் ஈரப்பதம்",
    kn: "ಸರಾಸರಿ ಮಣ್ಣಿನ ತೇವಾಂಶ",
    ml: "ശരാശരി മണ്ണിലെ ഈർപ്പം",
    te: "సగటు నేల తేమ"
  },
  "analytics.min_max_moisture": {
    en: "Min / Max Moisture",
    hi: "न्यूनतम / अधिकतम नमी",
    ta: "குறைந்தபட்ச / அதிகபட்ச ஈரப்பதம்",
    kn: "ಕನಿಷ್ಠ / ಗರಿಷ್ಠ ತೇವಾಂಶ",
    ml: "കുറഞ്ഞ / കൂടിയ ഈർപ്പം",
    te: "కనిష్ట / గరిష్ట తేమ"
  },
  "analytics.avg_temp": {
    en: "Average Temperature",
    hi: "औसत तापमान",
    ta: "சராசரி வெப்பநிலை",
    kn: "ಸರಾಸರಿ ತಾಪಮಾನ",
    ml: "ശരാശരി താപനില",
    te: "సగటు ఉష్ణోగ్రత"
  },
  "analytics.avg_humidity": {
    en: "Average Humidity",
    hi: "औसत आर्द्रता",
    ta: "சராசரி ஈரப்பதம்",
    kn: "ಸರಾಸರಿ ಆರ್ದ್ರತೆ",
    ml: "ശരാശരി ആർദ്രത",
    te: "సగటు తేమ శాతం"
  },
  "analytics.rain_events": {
    en: "Rain Events",
    hi: "बारिश की घटनाएं",
    ta: "மழை நிகழ்வுகள்",
    kn: "ಮಳೆಯ ಘಟನೆಗಳು",
    ml: "മഴ ഇവന്റുകൾ",
    te: "వర్షం సంఘటనలు"
  },
  "analytics.pump_runtime": {
    en: "Total Pump Runtime",
    hi: "कुल पंप चलने का समय",
    ta: "மொத்த பம்ப் இயங்கும் நேரம்",
    kn: "ಒಟ್ಟು ಪಂಪ್ ಚಾಲನೆಯ ಸಮಯ",
    ml: "ആകെ പമ്പ് പ്രവർത്തിച്ച സമയം",
    te: "మొత్తం పంప్ రన్ సమయం"
  },
  "analytics.total_water_used": {
    en: "Total Water Delivered",
    hi: "कुल पानी का उपयोग",
    ta: "வழங்கப்பட்ட மொத்த நீர்",
    kn: "ಒಟ್ಟು ಒದಗಿಸಲಾದ ನೀರು",
    ml: "വിതരണം ചെയ്ത ആകെ വെള്ളം",
    te: "అందించిన మొత్తం నీరు"
  },
  "analytics.irrigation_cycles": {
    en: "Irrigation Cycles",
    hi: "सिंचाई चक्र",
    ta: "நீர்ப்பாசன சுழற்சிகள்",
    kn: "ನೀರಾವರಿ ಚಕ್ರಗಳು",
    ml: "നനയ്ക്കൽ ചക്രങ്ങൾ",
    te: "నీటిపారుదల చక్రాలు"
  },
  "analytics.moisture_trend_title": {
    en: "Historical Soil Moisture Trend",
    hi: "ऐतिहासिक मिट्टी की नमी का रुझान",
    ta: "வரலாற்று மண் ஈரப்பதப் போக்கு",
    kn: "ಐತಿಹಾಸಿಕ ಮಣ್ಣಿನ ತೇವಾಂಶ ಪ್ರವೃತ್ತಿ",
    ml: "ചരിത്രപരമായ മണ്ണിലെ ഈർപ്പ പ്രവണത",
    te: "చారిత్రక నేల తేమ ధోరణి"
  },
  "analytics.moisture_trend_desc": {
    en: "Real telemetry moisture readings recorded by field soil probes over time",
    hi: "समय के साथ फील्ड मिट्टी जांच द्वारा रिकॉर्ड किए गए वास्तविक टेलीमेट्री नमी रीडिंग",
    ta: "காலப்போக்கில் கள மண் ஆய்வுகளால் பதிவு செய்யப்பட்ட உண்மையான டெலிமெட்ரி ஈரப்பதம் அளவீடுகள்",
    kn: "ಕಾಲಾನಂತರದಲ್ಲಿ ಕೃಷಿ ಮಣ್ಣಿನ ತನಿಖೆಗಳಿಂದ ದಾಖಲಾದ ನೈಜ ಟೆಲಿಮೆಟ್ರಿ ತೇವಾಂಶ ವಾಚನಗೋಷ್ಠಿಗಳು",
    ml: "ഫീൽഡ് സോയിൽ പ്രോബുകൾ രേഖപ്പെടുത്തിയ യഥാർത്ഥ ടെലിമെട്രി ഈർപ്പ റീഡിംഗുകൾ",
    te: "క్షేత్ర నేల ప్రోబ్‌ల ద్వారా నమోదు చేయబడిన వాస్తవ టెలిమెట్రీ తేమ రీడింగ్‌లు"
  },
  "analytics.water_usage_title": {
    en: "Historical Water Usage",
    hi: "ऐतिहासिक पानी का उपयोग",
    ta: "வரலாற்று நீர் பயன்பாடு",
    kn: "ಐತಿಹಾಸಿಕ ನೀರಿನ ಬಳಕೆ",
    ml: "ചരിത്രപരമായ ജല ഉപയോഗം",
    te: "చారిత్రక నీటి వినియోగం"
  },
  "analytics.water_usage_desc": {
    en: "Daily water volume delivered across all farm plots based on irrigation records",
    hi: "सिंचाई रिकॉर्ड के आधार पर सभी खेत भूखंडों में दिया गया दैनिक पानी का आयतन",
    ta: "நீர்ப்பாசனப் பதிவுகளின் அடிப்படையில் அனைத்து பண்ணை நிலங்களிலும் வழங்கப்பட்ட தினசரி நீரின் அளவு",
    kn: "ನೀರಾವರಿ ದಾಖಲೆಗಳ ಆಧಾರದ ಮೇಲೆ ಎಲ್ಲಾ ಕೃಷಿ ಪ್ಲಾಟ್‌ಗಳಲ್ಲಿ ಒದಗಿಸಲಾದ ದೈನಂದಿನ ನೀರಿನ ಪ್ರಮಾಣ",
    ml: "നനയ്ക്കൽ രേഖകളുടെ അടിസ്ഥാനത്തിൽ എല്ലാ ഫാം പ്ലോട്ടുകളിലും വിതരണം ചെയ്ത പ്രതിദിന ജലത്തിന്റെ അളവ്",
    te: "నీటిపారుదల రికార్డుల ఆధారంగా అన్ని వ్యవసాయ ప్లాట్లలో అందించబడిన రోజువారీ నీటి పరిమాణం"
  },
  "analytics.no_data_range": {
    en: "No telemetry data recorded for this time range",
    hi: "इस समय सीमा के लिए कोई टेलीमेट्री डेटा रिकॉर्ड नहीं किया गया है",
    ta: "இந்த நேர வரம்பிற்கு டெலிமெட்ரி தரவு எதுவும் பதிவு செய்யப்படவில்லை",
    kn: "ಈ ಸಮಯದ ಶ್ರೇಣಿಗೆ ಯಾವುದೇ ಟೆಲಿಮೆಟ್ರಿ ಡೇಟಾ ದಾಖಲಾಗಿಲ್ಲ",
    ml: "ഈ സമയപരിധിയിൽ ടെലിമെട്രി ഡാറ്റയൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല",
    te: "ఈ సమయ పరిధికి ఎలాంటి టెలిమెట్రీ డేటా నమోదు కాలేదు"
  },
  "analytics.mins_unit": {
    en: "{mins} mins",
    hi: "{mins} मिनट",
    ta: "{mins} நிமிடங்கள்",
    kn: "{mins} ನಿಮಿಷಗಳು",
    ml: "{mins} മിനിറ്റ്",
    te: "{mins} నిమిషాలు"
  },
  "analytics.liters_unit": {
    en: "{liters} L",
    hi: "{liters} ली",
    ta: "{liters} லி",
    kn: "{liters} ಲೀ",
    ml: "{liters} ലി",
    te: "{liters} లీ"
  },
  "analytics.events_unit": {
    en: "{count} events",
    hi: "{count} घटनाएं",
    ta: "{count} நிகழ்வுகள்",
    kn: "{count} ಘಟನೆಗಳು",
    ml: "{count} ഇവന്റുകൾ",
    te: "{count} సంఘటనలు"
  },
  "analytics.cycles_unit": {
    en: "{count} cycles",
    hi: "{count} चक्र",
    ta: "{count} சுழற்சிகள்",
    kn: "{count} ಚಕ್ರಗಳು",
    ml: "{count} ചക്രങ്ങൾ",
    te: "{count} చక్రాలు"
  },

  // Sensors Page
  "sensors.telemetry_title": {
    en: "Live Sensor Telemetry",
    hi: "लाइव सेंसर टेलीमेट्री",
    ta: "நேரலை சென்சார் டெலிமெட்ரி",
    kn: "ಲೈವ್ ಸಂವೇದಕ ಟೆಲಿಮೆಟ್ರಿ",
    ml: "തത്സമയ സെൻസർ ടെലിമെട്രി",
    te: "లైవ్ సెన్సార్ టెలిమెట్రీ"
  },
  "sensors.devices_title": {
    en: "Field Hardware Nodes",
    hi: "फील्ड हार्डवेयर नोड्स",
    ta: "கள வன்பொருள் முனையங்கள்",
    kn: "ಕೃಷಿ ಯಂತ್ರಾಂಶ ನೋಡ್‌ಗಳು",
    ml: "ഫീൽഡ് ഹാർഡ്‌വെയർ നോഡുകൾ",
    te: "క్షేత్ర హార్డ్‌వేర్ నోడ్‌లు"
  },
  "sensors.soil_moisture": {
    en: "Soil Moisture",
    hi: "मिट्टी की नमी",
    ta: "மண் ஈரப்பதம்",
    kn: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    ml: "മണ്ണിലെ ഈർപ്പം",
    te: "నేల తేమ"
  },
  "sensors.temperature": {
    en: "Temperature",
    hi: "तापमान",
    ta: "வெப்பநிலை",
    kn: "ತಾಪಮಾನ",
    ml: "താപനില",
    te: "ఉష్ణోగ్రత"
  },
  "sensors.humidity": {
    en: "Humidity",
    hi: "आर्द्रता",
    ta: "ஈரப்பதம்",
    kn: "ಆರ್ದ್ರತೆ",
    ml: "ആർദ്രത",
    te: "తేమ శాతం"
  },
  "sensors.rain_sensor": {
    en: "Rain Sensor",
    hi: "बारिश सेंसर",
    ta: "மழை சென்சார்",
    kn: "ಮಳೆ ಸಂವೇದಕ",
    ml: "മഴ സെൻസർ",
    te: "వర్షం సెన్సార్"
  },
  "sensors.tank_level": {
    en: "Water Tank Level",
    hi: "पानी की टंकी का स्तर",
    ta: "நீர் தொட்டி நிலை",
    kn: "ನೀರಿನ ಟ್ಯಾಂಕ್ ಮಟ್ಟ",
    ml: "വാട്ടർ ടാങ്ക് ലെവൽ",
    te: "నీటి ట్యాంక్ స్థాయి"
  },
  "sensors.gateway_battery": {
    en: "Gateway Battery",
    hi: "गेटवे बैटरी",
    ta: "கேட்வே பேட்டரி",
    kn: "ಗೇಟ್‌ವೇ ಬ್ಯಾಟರಿ",
    ml: "ഗേറ്റ്‌വേ ബാറ്ററി",
    te: "గేట్‌వే బ్యాటరీ"
  },
  "sensors.no_devices_found": {
    en: "No sensor devices registered for this farm",
    hi: "इस खेत के लिए कोई सेंसर डिवाइस पंजीकृत नहीं है",
    ta: "இந்த பண்ணைக்கு எந்த சென்சார் சாதனங்களும் பதிவு செய்யப்படவில்லை",
    kn: "ಈ ಕೃಷಿಗಾಗಿ ಯಾವುದೇ ಸಂವೇದಕ ಸಾಧನಗಳು ನೋಂದಾಯಿಸಿಲ್ಲ",
    ml: "ഈ ഫാമിൽ സെൻസർ ഉപകരണങ്ങളൊന്നും രജിസ്റ്റർ ചെയ്തിട്ടില്ല",
    te: "ఈ వ్యవసాయం కోసం ఎలాంటి సెన్సార్ పరికరాలు నమోదు కాలేదు"
  },
  "sensors.live_reading": {
    en: "Live Reading",
    hi: "लाइव रीडिंग",
    ta: "நேரலை அளவீடு",
    kn: "ಲೈವ್ ವಾಚನ",
    ml: "തത്സമയ റീഡിംഗ്",
    te: "లైవ్ రీడింగ్"
  },

  // Alerts Page
  "alerts.no_active_alerts": {
    en: "All systems optimal. No active warnings or alerts.",
    hi: "सभी प्रणालियाँ सामान्य हैं। कोई सक्रिय चेतावनी या अलर्ट नहीं है।",
    ta: "அனைத்து அமைப்புகளும் சரியாக உள்ளன. செயலில் உள்ள எச்சரிக்கைகள் எதுவும் இல்லை.",
    kn: "ಎಲ್ಲಾ ವ್ಯವಸ್ಥೆಗಳು ಸಾಮಾನ್ಯವಾಗಿವೆ. ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.",
    ml: "എല്ലാ സിസ്റ്റങ്ങളും സാധാരണ നിലയിലാണ്. സജീവമായ മുന്നറിയിപ്പുകളൊന്നുമില്ല.",
    te: "అన్ని వ్యవస్థలు సాధారణంగా ఉన్నాయి. సక్రియ హెచ్చరికలు ఏవీ లేవు."
  },
  "alerts.active_count": {
    en: "{count} Active Alerts",
    hi: "{count} सक्रिय अलर्ट",
    ta: "{count} செயலில் உள்ள எச்சரிக்கைகள்",
    kn: "{count} ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು",
    ml: "{count} സജീവ മുന്നറിയിപ്പുകൾ",
    te: "{count} సక్రియ హెచ్చరికలు"
  },
  "alerts.filter_all": {
    en: "All Severities",
    hi: "सभी गंभीरताएँ",
    ta: "அனைத்து நிலைகளும்",
    kn: "ಎಲ್ಲಾ ತೀವ್ರತೆಗಳು",
    ml: "എല്ലാ തീവ്രതകളും",
    te: "అన్ని తీవ్రతలు"
  },
  "alerts.filter_critical": {
    en: "Critical Only",
    hi: "केवल गंभीर",
    ta: "முக்கியமானவை மட்டும்",
    kn: "ನಿರ್ಣಾಯಕ ಮಾತ್ರ",
    ml: "ഗുരുതരമായവ മാത്രം",
    te: "కీలకమైనవి మాత్రమే"
  },
  "alerts.filter_warning": {
    en: "Warnings Only",
    hi: "केवल चेतावनियाँ",
    ta: "எச்சரிக்கைகள் மட்டும்",
    kn: "ಎಚ್ಚರಿಕೆಗಳು ಮಾತ್ರ",
    ml: "മുന്നറിയിപ്പുകൾ മാത്രം",
    te: "హెచ్చరికలు మాత్రమే"
  },
  "alerts.threshold_low_moisture": {
    en: "Critical Low Soil Moisture",
    hi: "गंभीर रूप से कम मिट्टी की नमी",
    ta: "மிகக் குறைந்த மண் ஈரப்பதம்",
    kn: "ತೀವ್ರ ಕಡಿಮೆ ಮಣ್ಣಿನ ತೇವಾಂಶ",
    ml: "ഗുരുതരമായ കുറഞ്ഞ മണ്ണിലെ ഈർപ്പം",
    te: "తీవ్రమైన తక్కువ నేల తేమ"
  },
  "alerts.threshold_low_moisture_desc": {
    en: "Soil moisture is below critical threshold. Immediate irrigation recommended.",
    hi: "मिट्टी की नमी महत्वपूर्ण सीमा से कम है। तत्काल सिंचाई की सिफारिश की जाती है।",
    ta: "மண் ஈரப்பதம் குறைந்தபட்ச வரம்பிற்கு கீழே உள்ளது. உடனடியாக நீர்ப்பாசனம் செய்ய பரிந்துரைக்கப்படுகிறது.",
    kn: "ಮಣ್ಣಿನ ತೇವಾಂಶವು ನಿರ್ಣಾಯಕ ಮಿತಿಗಿಂತ ಕಡಿಮೆಯಾಗಿದೆ. ತಕ್ಷಣ ನೀರಾವರಿ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.",
    ml: "മണ്ണിലെ ഈർപ്പം നിർണായക പരിധിക്ക് താഴെയാണ്. ഉടനടി നനയ്ക്കാൻ ശുപാർശ ചെയ്യുന്നു.",
    te: "నేల తేమ క్లిష్టమైన పరిమితి కంటే తక్కువగా ఉంది. తక్షణ నీటిపారుదల సిఫార్సు చేయబడింది."
  },
  "alerts.threshold_high_temp": {
    en: "High Ambient Temperature",
    hi: "अधिक परिवेशी तापमान",
    ta: "அதிக சுற்றுப்புற வெப்பநிலை",
    kn: "ಹೆಚ್ಚಿನ ಸುತ್ತಲಿನ ತಾಪಮಾನ",
    ml: "ഉയർന്ന അന്തരീക്ഷ താപനില",
    te: "అధిక పరిసర ఉష్ణోగ్రత"
  },
  "alerts.threshold_high_temp_desc": {
    en: "Field temperature exceeds optimal crop limits. Monitor crop stress.",
    hi: "खेत का तापमान इष्टतम फसल सीमाओं से अधिक है। फसल तनाव की निगरानी करें।",
    ta: "கள வெப்பநிலை உகந்த பயிர் வரம்புகளை விட அதிகமாக உள்ளது. பயிர் அழுத்தத்தைக் கண்காணிக்கவும்.",
    kn: "ಕೃಷಿ ತಾಪಮಾನವು ಸೂಕ್ತ ಬೆಳೆ ಮಿತಿಗಳನ್ನು ಮೀರಿದೆ. ಬೆಳೆ ಒತ್ತಡವನ್ನು ಗಮನಿಸಿ.",
    ml: "ഫീൽഡ് താപനില അനുയോജ്യമായ വിള പരിധിയേക്കാൾ കൂടുതലാണ്. വിള സമ്മർദ്ദം നിരീക്ഷിക്കുക.",
    te: "క్షేత్ర ఉష్ణోగ్రత సరైన పంట పరిమితులను మించిపోయింది. పంట ఒత్తిడిని గమనించండి."
  },
  "alerts.threshold_rain": {
    en: "Rain Detected on Field",
    hi: "खेत पर बारिश का पता चला",
    ta: "பண்ணையில் மழை கண்டறியப்பட்டது",
    kn: "ಕೃಷಿಯಲ್ಲಿ ಮಳೆ ಪತ್ತೆಯಾಗಿದೆ",
    ml: "പാടത്ത് മഴ കണ്ടെത്തി",
    te: "పొలంలో వర్షం గుర్తించబడింది"
  },
  "alerts.threshold_rain_desc": {
    en: "Field rain sensor detected precipitation. Automated irrigation cycle paused.",
    hi: "फील्ड वर्षा सेंसर ने वर्षा का पता लगाया। स्वचालित सिंचाई चक्र रोक दिया गया।",
    ta: "கள மழை சென்சார் மழையைக் கண்டறிந்தது. தானியங்கி நீர்ப்பாசன சுழற்சி இடைநிறுத்தப்பட்டது.",
    kn: "ಕೃಷಿ ಮಳೆ ಸಂವೇದಕ ಮಳೆಯನ್ನು ಪತ್ತೆಹಚ್ಚಿದೆ. ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿ ಚಕ್ರವನ್ನು ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ.",
    ml: "ഫീൽഡ് റെയിൻ സെൻസർ മഴ കണ്ടെത്തി. ഓട്ടോമേറ്റഡ് നനയ്ക്കൽ ചക്രം നിർത്തിവച്ചു.",
    te: "ఫీల్డ్ వర్షం సెన్సార్ వర్షపాతాన్ని గుర్తించింది. ఆటోమేటెడ్ నీటిపారుదల చక్రం నిలిపివేయబడింది."
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
console.log("Successfully rebuilt lib/i18n.tsx with complete farmer & buyer translations!");
