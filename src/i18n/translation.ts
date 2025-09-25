// src/i18n/translation.ts
export type Language = "en" | "ar";

const translations: Record<Language, Record<string, string>> = {
  en: {
    email: "Email",
    password: "Password",
    submit: "Submit",
    invalidEmail: "Invalid email address",
    invalidPassword:
      "Password must be 8-15 characters with 1 capital letter, 1 number, and 1 special character",
    popularMovies: "Popular Movies",
    logout: "Logout",
    switchToArabic: "Arabic",
    switchToEnglish: "English",
  },
  ar: {
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "إرسال",
    invalidEmail: "بريد إلكتروني غير صالح",
    invalidPassword:
      "يجب أن تكون كلمة المرور بين 8-15 حرفًا وتحتوي على حرف كبير واحد ورقم وحرف خاص",
    popularMovies: "الأفلام الشعبية",
    logout: "تسجيل الخروج",
    switchToArabic: "العربية",
    switchToEnglish: "الإنجليزية",
  },
};

export function t(lang: Language, key: string): string {
  return translations[lang]?.[key] || key;
}

export default translations;