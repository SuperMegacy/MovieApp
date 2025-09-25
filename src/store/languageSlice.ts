// src/store/languageSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "ar";

interface LanguageState {
  language: Language;
}

const initialState: LanguageState = {
  language: "en", // default
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
