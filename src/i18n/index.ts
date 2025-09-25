import { I18n } from "i18n-js";

const en = {
    email: "Email",
    password: "Password",
    submit: "Submit",
    popularMovies: "Popular Movies",
    logout: "Logout",
    invalidEmail: "Please enter a valid email",
    invalidPassword:
        "Password must be 8-15 chars, include 1 uppercase, 1 digit and 1 special char",
    loading: "Loading...",
    switchToArabic: "العربية",
    switchToEnglish: "English",
};

const ar = {

    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "إرسال",
    popularMovies: "الأفلام الشهيرة",
    logout: "تسجيل الخروج",
    invalidEmail: "يرجى إدخال بريد إلكتروني صالح",
    invalidPassword:
        "يجب أن تكون كلمة المرور 8-15 حرفًا، مع حرف كبير واحد، رقم واحد وحرف خاص واحد",
    loading: "جارٍ التحميل...",
    switchToArabic: "العربية",
    switchToEnglish: "English",
};

(I18n as any).translations = { ar, en };
(I18n as any).defaultLocale = "en";
(I18n as any).locale = "en"; // start with English
(I18n as any).fallbacks = ["en"]; // set English as fallback

export default I18n;