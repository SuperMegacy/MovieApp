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
  Animated,
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

const { width, height } = Dimensions.get("window");
const SIDE_PADDING = 12;
const CARD_SPACING = 8;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - CARD_SPACING * 5) / 6; // 6 columns

const TOP_CAROUSEL_HEIGHT = 160;

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
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9} style={styles.movieCard}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.noImage]}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}
      <View style={styles.cardTitleWrap}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.vote_average ? (
          <Text style={styles.ratingText}>⭐ {item.vote_average.toFixed(1)}</Text>
        ) : null}
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

  // Scroll states
  const [showPagination, setShowPagination] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  // Refs
  const carouselIndexRef = useRef(0);
  const carouselFlatRef = useRef<FlatList<Movie> | null>(null);
  const mainScrollRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll events
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    
    // Show pagination when near bottom
    if (offsetY + layoutHeight >= contentHeight - 100) {
      setShowPagination(true);
    } else {
      setShowPagination(false);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to hide pagination when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setShowPagination(false);
    }, 2000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
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

  // Load top carousel
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

  // Autoplay carousel
  useEffect(() => {
    if (carouselItems.length === 0) return;
    
    const id = setInterval(() => {
      if (!carouselFlatRef.current) return;
      carouselIndexRef.current = (carouselIndexRef.current + 1) % carouselItems.length;
      carouselFlatRef.current.scrollToIndex({ 
        index: carouselIndexRef.current, 
        animated: true 
      });
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
    // Scroll to top when changing pages
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

  const logout = () => {
    dispatch(clearCredentials());
  };

  // Page numbers helper
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
      {/* Fixed Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>🎬 {t("popularMovies")}</Text>
        <View style={styles.topActions}>
          <View style={styles.searchWrap}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search movies..."
              onSubmitEditing={onSearch}
              style={styles.searchInput}
              returnKeyType="search"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={onSearch} style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>{t("Logout")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scrollable Content */}
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
        <View style={styles.carouselWrap}>
          <FlatList
            data={carouselItems}
            horizontal
            ref={carouselFlatRef}
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
                    <Text style={styles.noImageText}>No Image</Text>
                  </View>
                )}
                <View style={styles.carouselTextWrap}>
                  <Text style={styles.carouselTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.vote_average ? (
                    <Text style={styles.carouselRating}>⭐ {item.vote_average.toFixed(1)}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            pagingEnabled={false}
          />
        </View>

        {/* Genres Filter */}
        <View style={styles.genresContainer}>
          <Text style={styles.genresTitle}>Genres</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genresScroll}>
            <TouchableOpacity
              style={[styles.genreChip, selectedGenre === null && styles.genreChipSelected]}
              onPress={() => onSelectGenre(null)}
            >
              <Text style={[styles.genreChipText, selectedGenre === null && styles.genreChipTextSelected]}>
                All
              </Text>
            </TouchableOpacity>
            {genres.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.genreChip, selectedGenre === g.id && styles.genreChipSelected]}
                onPress={() => onSelectGenre(g.id)}
              >
                <Text style={[styles.genreChipText, selectedGenre === g.id && styles.genreChipTextSelected]}>
                  {g.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Movies Grid - 6 Columns */}
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
                    index % 6 === 5 ? styles.lastInRow : null
                  ]}
                >
                  <MovieCard item={movie} onPress={openDetails} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No movies found</Text>
            </View>
          )}
        </View>

        {/* Spacer for pagination */}
        <View style={styles.paginationSpacer} />
      </ScrollView>

      {/* Pagination - Only shows when scrolled to bottom */}
      {showPagination && (
        <View style={styles.paginationContainer}>
          <View style={styles.pagination}>
            <PaginationButton 
              onPress={() => goToPage(page - 1)} 
              label="‹ Prev" 
            />
            {pageNumbers.map((p) => (
              <PaginationButton
                key={p}
                onPress={() => goToPage(p)}
                label={p.toString()}
                active={p === page}
              />
            ))}
            <PaginationButton 
              onPress={() => goToPage(page + 1)} 
              label="Next ›" 
            />
          </View>
        </View>
      )}

      {/* Movie details modal */}
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
              ) : (
                <View style={[styles.modalPoster, styles.noImage]}>
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{activeMovie?.title}</Text>
                <View style={styles.modalDetails}>
                  {activeMovie?.release_date ? (
                    <Text style={styles.modalSub}>📅 {activeMovie.release_date}</Text>
                  ) : null}
                  {activeMovie?.vote_average ? (
                    <Text style={styles.modalSub}>⭐ {activeMovie.vote_average}/10</Text>
                  ) : null}
                </View>
                <Text style={styles.modalOverview}>{activeMovie?.overview}</Text>
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
                <Text style={styles.modalCloseText}>Close</Text>
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
  container: { 
    flex: 1, 
    backgroundColor: "#0f0f1a" 
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 100, // Space for pagination
  },

  topBar: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 12,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4a",
    zIndex: 1000,
  },
  appTitle: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#fff",
    marginBottom: 8,
  },
  topActions: { 
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between",
  },

  searchWrap: { 
    flexDirection: "row", 
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#0f0f1a",
    marginRight: 8,
    color: "#fff",
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBtnText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 16,
  },

  logoutBtn: {
    backgroundColor: "#ff4757",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { 
    color: "#fff", 
    fontWeight: "600" 
  },

  carouselWrap: {
    height: TOP_CAROUSEL_HEIGHT,
    backgroundColor: "#1a1a2e",
    paddingVertical: 12,
  },
  carouselItem: {
    width: width * 0.4,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0f0f1a",
  },
  carouselImage: {
    width: "100%",
    height: TOP_CAROUSEL_HEIGHT - 50,
    backgroundColor: "#2a2a4a",
  },
  carouselTextWrap: {
    padding: 8,
    backgroundColor: "#1a1a2e",
  },
  carouselTitle: { 
    fontSize: 14, 
    fontWeight: "700", 
    color: "#fff" 
  },
  carouselRating: {
    fontSize: 12,
    color: "#ffd700",
    marginTop: 2,
  },

  genresContainer: {
    padding: SIDE_PADDING,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4a",
  },
  genresTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  genresScroll: {
    flexGrow: 0,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    backgroundColor: "#0f0f1a",
    marginRight: 8,
  },
  genreChipSelected: {
    backgroundColor: "#0a84ff",
    borderColor: "#0a84ff",
  },
  genreChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  genreChipTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },

  moviesGrid: {
    padding: SIDE_PADDING,
    minHeight: 400,
  },

  loader: {
    marginTop: 40,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  movieCardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    marginBottom: CARD_SPACING,
  },
  
  lastInRow: {
    marginRight: 0,
  },

  movieCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  poster: { 
    width: "100%", 
    height: CARD_WIDTH * 1.5, 
    backgroundColor: "#2a2a4a" 
  },
  noImage: { 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "#2a2a4a",
  },
  noImageText: {
    color: "#fff",
    fontSize: 10,
  },
  cardTitleWrap: { 
    padding: 6,
  },
  cardTitle: { 
    fontSize: 11, 
    fontWeight: "600", 
    color: "#fff",
    marginBottom: 2,
    lineHeight: 14,
  },
  ratingText: {
    fontSize: 10,
    color: "#ffd700",
    fontWeight: '600',
  },

  paginationSpacer: {
    height: 20,
  },

  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pagination: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    padding: 12,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#2a2a4a",
    marginHorizontal: 20,
  },
  pageBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    backgroundColor: "#0f0f1a",
    minWidth: 40,
    alignItems: 'center',
  },
  pageBtnActive: {
    backgroundColor: "#0a84ff",
    borderColor: "#0a84ff",
  },
  pageBtnText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 12,
  },
  pageBtnTextActive: { 
    color: "#fff", 
    fontWeight: "700" 
  },

  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    maxHeight: "90%",
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a4a",
  },
  modalPoster: { 
    width: "100%", 
    height: 400, 
    backgroundColor: "#2a2a4a" 
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#fff",
    marginBottom: 8,
  },
  modalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalSub: { 
    color: "#ccc", 
    fontSize: 14,
  },
  modalOverview: { 
    color: "#fff", 
    fontSize: 16,
    lineHeight: 22,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#2a2a4a",
    alignItems: "center",
  },
  modalCloseBtn: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 16,
  },
});