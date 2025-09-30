
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials } from "../store/authSlice";
import { setLanguage } from "../store/languageSlice";
import { getPopularMovies, getGenres, discoverByGenre, searchMovies, Movie, Genre } from "../api/tmdb";
import { useTranslation } from "../store/hooks";

import MovieCard from "../components/MovieCard";
import PaginationButton from "../components/PaginationButton";
import Carousel from "../components/Carousel";
import GenresFilter from "../components/GenresFilter";
import MovieModal from "../components/MovieModal";

import styles from "../styles/screen2.styles";

const { width } = Dimensions.get("window");
const CARD_SPACING = 8;

const Screen2: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t, lang } = useTranslation();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [carouselItems, setCarouselItems] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showPagination, setShowPagination] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const mainScrollRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show/hide pagination when near bottom
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    if (offsetY + layoutHeight >= contentHeight - 100) {
      setShowPagination(true);
    } else {
      setShowPagination(false);
    }

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    scrollTimeoutRef.current = setTimeout(() => {
      setShowPagination(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Fetch genres once
  const loadGenres = useCallback(async () => {
    try {
      const g = await getGenres();
      setGenres(g.genres);
    } catch (err) {
      console.error("Failed loading genres", err);
    }
  }, []);

  // Central load function
  const load = useCallback(
    async (p = 1) => {
      try {
        if (p === 1) setLoading(true);
        setRefreshing(false);

        let res;
        if (searchMode && searchQuery.trim().length > 0) {
          res = await searchMovies(searchQuery.trim(), p);
        } else if (selectedGenre) {
          res = await discoverByGenre(selectedGenre, p);
        } else {
          res = await getPopularMovies(p);
        }

        setMovies(res.results);
        setTotalPages(res.total_pages ?? 1);
        setPage(res.page ?? p);
      } catch (err) {
        console.error("Failed loading movies", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchMode, searchQuery, selectedGenre]
  );

  const loadCarousel = useCallback(async () => {
    try {
      const res = await getPopularMovies(1);
      setCarouselItems(res.results.slice(0, 8));
    } catch (err) {
      console.error("Failed loading carousel items", err);
    }
  }, []);

  useEffect(() => {
    loadGenres();
    load(1);
    loadCarousel();
  }, [loadGenres, load, loadCarousel]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(1);
    setPage(1);
  }, [load]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    load(p);
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onSelectGenre = (id: number | null) => {
    setSelectedGenre(id);
    setSearchMode(false);
    setSearchQuery("");
    load(1);
  };

  const onSearch = () => {
    setSearchMode(searchQuery.trim().length > 0);
    setSelectedGenre(null);
    load(1);
  };

  const openDetails = (m: Movie) => {
    setActiveMovie(m);
    setModalVisible(true);
  };

  // language toggle that updates redux language
  const toggleLang = () => {
    const next = lang === "en" ? "ar" : "en";
    dispatch(setLanguage(next));
  };

  const logout = () => {
    dispatch(clearCredentials());
  };

  const pageNumbers = useMemo(() => {
    const current = page;
    const max = totalPages;
    const window = 2;
    const pages: number[] = [];
    const start = Math.max(1, current - window);
    const end = Math.min(max, current + window);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  // safe placeholder for search (fall back to english literal)
  const searchPlaceholder = t("searchPlaceholder") === "searchPlaceholder" ? "Search movies..." : t("searchPlaceholder");

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>🎬 {t("popularMovies")}</Text>
        <View style={styles.topActions}>
          <View style={styles.searchWrap}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
              onSubmitEditing={onSearch}
              style={[styles.searchInput, lang === "ar" ? { textAlign: "right" } : undefined]}
              returnKeyType="search"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={onSearch} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={toggleLang} style={[styles.logoutBtn, { marginLeft: 8 }]}>
            <Text style={styles.logoutText}>{lang === "en" ? t("switchToArabic") : t("switchToEnglish")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { marginLeft: 8 }]}>
            <Text style={styles.logoutText}>{t("logout")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={mainScrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0a84ff"]}
            tintColor="#0a84ff"
          />
        }
      >
        {/* Carousel */}
        <Carousel items={carouselItems} onPress={openDetails} />

        {/* Genres */}
        <GenresFilter genres={genres} selected={selectedGenre} onSelect={onSelectGenre} />

        {/* Movies Grid */}
        <View style={styles.moviesGrid}>
          {loading ? (
            <ActivityIndicator style={styles.loader} size="large" color="#0a84ff" />
          ) : movies.length > 0 ? (
            <View style={styles.gridContainer}>
              {movies.map((movie, index) => (
                <View
                  key={movie.id}
                  style={[
                    styles.movieCardWrapper,
                    index % 6 === 5 ? { marginRight: 0 } : null,
                  ]}
                >
                  <MovieCard item={movie} onPress={openDetails} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>{t("noMoviesFound") === "noMoviesFound" ? "No movies found" : t("noMoviesFound")}</Text>
            </View>
          )}
        </View>

        <View style={styles.paginationSpacer} />
      </ScrollView>

      {/* Pagination */}
      {showPagination && (
        <View style={styles.paginationContainer}>
          <View style={styles.pagination}>
            <PaginationButton onPress={() => goToPage(page - 1)} label="‹ Prev" />
            {pageNumbers.map((p) => (
              <PaginationButton
                key={p}
                onPress={() => goToPage(p)}
                label={p.toString()}
                active={p === page}
              />
            ))}
            <PaginationButton onPress={() => goToPage(page + 1)} label="Next ›" />
          </View>
        </View>
      )}

      {/* Modal */}
      <MovieModal
        visible={modalVisible}
        movie={activeMovie}
        onClose={() => {
          setModalVisible(false);
          setActiveMovie(null);
        }}
      />
    </View>
  );
};

export default Screen2;
