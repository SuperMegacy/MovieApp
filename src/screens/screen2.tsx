import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import {
  getPopularMovies,
  IMAGE_BASE,
  Movie,
  getGenres,
  Genre,
  discoverByGenre,
  searchMovies,
} from "../api/tmdb";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials } from "../store/authSlice";
import { t } from "../i18n/translation";

const { width } = Dimensions.get("window");
const SIDE_PADDING = 12;
const CARD_SPACING = 12;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - CARD_SPACING) / 2; // two columns

const TOP_CAROUSEL_HEIGHT = 180;

const PaginationButton: React.FC<{ active?: boolean; onPress: () => void; label: string }> = ({
  active,
  onPress,
  label,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.pageBtn, active ? styles.pageBtnActive : undefined]}
    activeOpacity={0.8}
  >
    <Text style={[styles.pageBtnText, active ? styles.pageBtnTextActive : undefined]}>{label}</Text>
  </TouchableOpacity>
);

const MovieCard: React.FC<{ item: Movie; onPress: (m: Movie) => void }> = ({ item, onPress }) => {
  const posterUrl = item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : null;
  return (
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.8} style={styles.movieCard}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.noImage]}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.cardTitleWrap}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const Screen2: React.FC = () => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((s) => s.language.language);

  // Data states
  const [movies, setMovies] = useState<Movie[]>([]);
  const [carouselItems, setCarouselItems] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  // Carousel auto-play ref
  const carouselIndexRef = useRef(0);
  const carouselFlatRef = useRef<FlatList<Movie> | null>(null);

  // Fetch genres once
  const loadGenres = useCallback(async () => {
    try {
      const g = await getGenres();
      setGenres(g.genres);
    } catch (err) {
      console.error("Failed loading genres", err);
    }
  }, []);

  // Central load function (respects search and genre)
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

  // Load top carousel (first page popular)
  const loadCarousel = useCallback(async () => {
    try {
      const res = await getPopularMovies(1);
      // show top 6 items
      setCarouselItems(res.results.slice(0, 6));
    } catch (err) {
      console.error("Failed loading carousel items", err);
    }
  }, []);

  useEffect(() => {
    // initial loads
    loadGenres();
    load(1);
    loadCarousel();
  }, [loadGenres, load, loadCarousel]);

  // Autoplay carousel every 4s
  useEffect(() => {
    const id = setInterval(() => {
      if (!carouselFlatRef.current || carouselItems.length === 0) return;
      carouselIndexRef.current = (carouselIndexRef.current + 1) % carouselItems.length;
      carouselFlatRef.current.scrollToIndex({ index: carouselIndexRef.current, animated: true });
    }, 4000);
    return () => clearInterval(id);
  }, [carouselItems.length]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(1);
    setPage(1);
  }, [load]);

  // Pagination handlers
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    load(p);
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

  const logout = () => {
    dispatch(clearCredentials());
  };

  // Small helper to render page numbers (show window around current)
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

  return (
    <View style={styles.container}>
      {/* Top nav + search */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>{t(lang, "popularMovies")}</Text>
        <View style={styles.topActions}>
          <View style={styles.searchWrap}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search movies..."
              onSubmitEditing={onSearch}
              style={styles.searchInput}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={onSearch} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>{t(lang, "logout")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Carousel */}
      <View style={styles.carouselWrap}>
        <FlatList
          data={carouselItems}
          horizontal
          ref={(r) => {
               carouselFlatRef.current = r;
              }}
          keyExtractor={(it) => it.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => openDetails(item)}
              style={styles.carouselItem}
            >
              {item.poster_path ? (
                <Image
                  source={{ uri: `${IMAGE_BASE}${item.poster_path}` }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.carouselImage, styles.noImage]}>
                  <Text>No Image</Text>
                </View>
              )}
              <View style={styles.carouselTextWrap}>
                <Text style={styles.carouselTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
        />
      </View>

      {/* Content area: movies + right-side genres (responsive) */}
      <View style={styles.contentRow}>
        {/* Movies grid */}
        <View style={styles.moviesColumn}>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : (
            <FlatList
              data={movies}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <MovieCard item={item} onPress={openDetails} />}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={{ padding: SIDE_PADDING }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View style={{ padding: 20 }}>
                  <Text>No movies found.</Text>
                </View>
              }
            />
          )}

          {/* Pagination footer */}
          <View style={styles.pagination}>
            <PaginationButton onPress={() => goToPage(page - 1)} label="Prev" />
            {pageNumbers.map((p) => (
              <PaginationButton
                key={p}
                onPress={() => goToPage(p)}
                label={p.toString()}
                active={p === page}
              />
            ))}
            <PaginationButton onPress={() => goToPage(page + 1)} label="Next" />
          </View>
        </View>

        {/* Right-hand side: genres (on wide screens) */}
        <View style={styles.sideColumn}>
          <Text style={styles.sideTitle}>Genres</Text>
          <ScrollView style={{ marginTop: 8 }}>
            <TouchableOpacity
              style={[styles.genreItem, selectedGenre === null && styles.genreSelected]}
              onPress={() => onSelectGenre(null)}
            >
              <Text style={[styles.genreText, selectedGenre === null && styles.genreTextSelected]}>
                All
              </Text>
            </TouchableOpacity>

            {genres.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.genreItem, selectedGenre === g.id && styles.genreSelected]}
                onPress={() => onSelectGenre(g.id)}
              >
                <Text style={[styles.genreText, selectedGenre === g.id && styles.genreTextSelected]}>
                  {g.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal for movie details */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              {activeMovie?.poster_path ? (
                <Image
                  source={{ uri: `${IMAGE_BASE}${activeMovie.poster_path}` }}
                  style={styles.modalPoster}
                  resizeMode="cover"
                />
              ) : null}
              <View style={{ padding: 12 }}>
                <Text style={styles.modalTitle}>{activeMovie?.title}</Text>
                {activeMovie?.release_date ? (
                  <Text style={styles.modalSub}>{activeMovie.release_date}</Text>
                ) : null}
                {activeMovie?.vote_average ? (
                  <Text style={styles.modalSub}>Rating: {activeMovie.vote_average}</Text>
                ) : null}
                <Text style={{ marginTop: 8 }}>{activeMovie?.overview}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setActiveMovie(null);
                }}
                style={styles.modalCloseBtn}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Screen2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f8" },

  topBar: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: { fontSize: 20, fontWeight: "800" },
  topActions: { flexDirection: "row", alignItems: "center" },

  searchWrap: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  searchInput: {
    width: 220,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  searchBtn: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBtnText: { color: "#fff", fontWeight: "600" },

  logoutBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "600" },

  carouselWrap: {
    height: TOP_CAROUSEL_HEIGHT,
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  carouselItem: {
    width: Math.round(width * 0.6),
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: TOP_CAROUSEL_HEIGHT - 40,
    backgroundColor: "#ddd",
  },
  carouselTextWrap: {
    padding: 8,
    backgroundColor: "#ffffff",
  },
  carouselTitle: { fontSize: 16, fontWeight: "700" },

  contentRow: {
    flex: 1,
    flexDirection: "row",
  },

  moviesColumn: {
    flex: 1,
  },

  sideColumn: {
    width: 160,
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
    backgroundColor: "#fff",
    padding: 10,
  },
  sideTitle: { fontSize: 16, fontWeight: "700" },

  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: SIDE_PADDING,
  },

  movieCard: {
    width: CARD_WIDTH,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  poster: { width: "100%", height: CARD_WIDTH * 1.4, backgroundColor: "#ddd" },
  noImage: { alignItems: "center", justifyContent: "center" },
  cardTitleWrap: { padding: 8 },
  cardTitle: { fontSize: 14, fontWeight: "700" },

  pagination: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8 as any,
    flexWrap: "wrap",
  },
  pageBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
  },
  pageBtnActive: {
    backgroundColor: "#0a84ff",
    borderColor: "#0a84ff",
  },
  pageBtnText: { color: "#111" },
  pageBtnTextActive: { color: "#fff", fontWeight: "700" },

  genreItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  genreSelected: { backgroundColor: "#0a84ff", borderColor: "#0a84ff" },
  genreText: { color: "#111" },
  genreTextSelected: { color: "#fff", fontWeight: "700" },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalPoster: { width: "100%", height: 360, backgroundColor: "#ddd" },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalSub: { color: "#555", marginTop: 4 },
  modalFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "flex-end",
  },
  modalCloseBtn: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
