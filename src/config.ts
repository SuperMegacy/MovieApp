import Constants from "expo-constants";

export const TMDB_API_KEY: string =
  (Constants.expoConfig?.extra?.TMDB_API_KEY as string) ?? "";
