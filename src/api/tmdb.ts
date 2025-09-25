import { TMDB_API_KEY } from "../config";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function getPopularMovies(page = 1) {
  const url = `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}
