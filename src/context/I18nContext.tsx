import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "hi";

const dict = {
  en: {
    "nav.home": "Home",
    "nav.doctors": "Doctors",
    "nav.pricing": "Pricing",
    "nav.dashboard": "Dashboard",
    "nav.bookNow": "Book now",
    "hero.badge": "Powered by Lovable AI · v1.0",
    "hero.tagline": "Healthcare, reimagined.",
    "hero.subtitle": "An intelligent care companion — meet verified doctors on video, get instant prescriptions, and keep your entire health story in one calm, private place.",
    "hero.book": "Book Appointment",
    "hero.consult": "Start Consultation",
    "hero.scroll": "SCROLL ↓",
    "features.kicker": "— PLATFORM —",
    "features.title1": "Everything you need.",
    "features.title2": "Nothing you don't.",
    "features.subtitle": "A complete healthcare suite, woven from intelligent micro-experiences.",
    "doctors.kicker": "OUR HEALERS",
    "doctors.title1": "Trusted doctors.",
    "doctors.title2": "Hand-picked.",
    "doctors.subtitle": "Every specialist verified, rated, and ready to care for you within the hour.",
    "doctors.book": "Book consult",
    "founders.kicker": "— THE MINDS BEHIND —",
    "founders.title1": "Built by founders who",
    "founders.title2": "believe in the vision.",
    "founders.subtitle": "Three builders, one shared mission — to reshape how India experiences healthcare.",
    "founders.story.kicker": "— THE FOUNDER STORY —",
    "founders.story": '"Dhanvantara AI was born from a shared vision to combine healthcare and technology in a meaningful way."',
    "founders.vision": "This is not just a project — it's the foundation of a future healthcare ecosystem.",
    "pricing.kicker": "— PRICING —",
    "pricing.title1": "Care that",
    "pricing.title2": "scales",
    "pricing.title3": "with you.",
    "pricing.subtitle": "Your first 5 consultations are on us. Always.",
    "pricing.mostLoved": "Most loved",
    "footer.tagline": "Ancient Wisdom. Modern Healing.",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.careers": "Careers",
    "footer.press": "Press",
    "footer.contact": "Contact",
    "footer.built": "Built with ❤️ in Bharat 🇮🇳",
    "footer.power": "Powering the future of healthcare",
    "lang.label": "Language",
  },
  hi: {
    "nav.home": "होम",
    "nav.doctors": "डॉक्टर",
    "nav.pricing": "मूल्य",
    "nav.dashboard": "डैशबोर्ड",
    "nav.bookNow": "अभी बुक करें",
    "hero.badge": "Lovable AI द्वारा संचालित · v1.0",
    "hero.tagline": "प्राचीन ज्ञान। आधुनिक उपचार।",
    "hero.subtitle": "AI द्वारा संचालित बुद्धिमान स्वास्थ्य सेवा का अनुभव करें — विश्वसनीय डॉक्टरों को बुक करें, वीडियो परामर्श लें और तुरंत प्रिस्क्रिप्शन प्राप्त करें।",
    "hero.book": "अपॉइंटमेंट बुक करें",
    "hero.consult": "परामर्श शुरू करें",
    "hero.scroll": "स्क्रॉल ↓",
    "features.kicker": "— प्लेटफ़ॉर्म —",
    "features.title1": "वह सब कुछ जो आपको चाहिए।",
    "features.title2": "वह कुछ नहीं जो नहीं चाहिए।",
    "features.subtitle": "बुद्धिमान सूक्ष्म-अनुभवों से बुना एक संपूर्ण स्वास्थ्य सूट।",
    "doctors.kicker": "हमारे चिकित्सक",
    "doctors.title1": "विश्वसनीय डॉक्टर।",
    "doctors.title2": "विशेष रूप से चुने गए।",
    "doctors.subtitle": "हर विशेषज्ञ सत्यापित, मूल्यांकित और एक घंटे के भीतर आपकी देखभाल के लिए तैयार।",
    "doctors.book": "परामर्श बुक करें",
    "founders.kicker": "— मस्तिष्क के पीछे —",
    "founders.title1": "उन संस्थापकों द्वारा निर्मित जो",
    "founders.title2": "इस दृष्टि पर विश्वास करते हैं।",
    "founders.subtitle": "दो निर्माता, एक साझा मिशन — भारत के स्वास्थ्य अनुभव को नया रूप देना।",
    "founders.story.kicker": "— संस्थापक की कहानी —",
    "founders.story": '"धन्वंतरि AI का जन्म स्वास्थ्य और प्रौद्योगिकी को सार्थक रूप से जोड़ने की एक साझा दृष्टि से हुआ।"',
    "founders.vision": "यह केवल एक परियोजना नहीं — यह भविष्य के स्वास्थ्य पारिस्थितिकी तंत्र की नींव है।",
    "pricing.kicker": "— मूल्य निर्धारण —",
    "pricing.title1": "देखभाल जो",
    "pricing.title2": "बढ़ती है",
    "pricing.title3": "आपके साथ।",
    "pricing.subtitle": "आपके पहले 5 परामर्श हमारी ओर से। हमेशा।",
    "pricing.mostLoved": "सबसे पसंदीदा",
    "footer.tagline": "प्राचीन ज्ञान। आधुनिक उपचार।",
    "footer.privacy": "गोपनीयता",
    "footer.terms": "शर्तें",
    "footer.careers": "करियर",
    "footer.press": "प्रेस",
    "footer.contact": "संपर्क",
    "footer.built": "❤️ के साथ भारत में निर्मित 🇮🇳",
    "footer.power": "स्वास्थ्य सेवा के भविष्य को सशक्त बनाना",
    "lang.label": "भाषा",
  },
} as const;

type Key = keyof (typeof dict)["en"];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("dhanvantara.lang") as Lang) || "en");
  useEffect(() => {
    localStorage.setItem("dhanvantara.lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => setLangState(l);
  const t = (k: Key) => (dict[lang] as Record<string, string>)[k] ?? (dict.en as Record<string, string>)[k] ?? k;
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("useI18n must be inside I18nProvider");
  return c;
}
