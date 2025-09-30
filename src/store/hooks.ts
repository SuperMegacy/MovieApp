import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";
import { t } from "../i18n/translation";
import { Language } from "./languageSlice";


export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// translation hook using redux state
export function useTranslation() {
  const lang = useAppSelector((s) => s.language.language);
  return {
    t: (key: string) => t(lang as Language, key),
    lang,
  };
}