import { TMDB_API_KEY } from "../config";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Basic Movie type


export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    overview?: string;
    release_date?: string;
    vote_average?: number;
    genre_ids?: number[];
}

// Generic paged response from TMDB (popular, seacrh, discover)

export interface PagedResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// get popular movies (using page param)

export async function getPopularMovies(page = 1): Promise<PagedResponse> {
  const url = `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`TMDB getPopularMovies failed ${res.status} - ${txt}`);
  }

  return res.json();  
}

// Search movies by query

export async function searchMovies(query: string, page = 1): Promise<PagedResponse> {
  const encoded = encodeURIComponent(query);
  const url = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encoded}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`TMDB searchMovies failed ${res.status} - ${txt}`);
  }

  return res.json();
}

// get all genres (id + name)

export interface Genre {
  id: number;
  name: string;
}

// TMDB genre list response

export interface GenreList {
  genres: Genre[];
}

export async function getGenreList(): Promise<GenreList> {
  const url = `${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`TMDB getGenreList failed ${res.status} - ${txt}`);
  }

  return res.json();
}

// get movie details by genre id

export async function discoverByGenre(genreId: number, page = 1): Promise<PagedResponse> {
  const url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genreId}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`TMDB discoverByGenre failed ${res.status} - ${txt}`);
  }

  return res.json();
  
}