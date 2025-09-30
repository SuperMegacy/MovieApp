import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");
const SIDE_PADDING = 12;
const CARD_SPACING = 8;
const CARD_WIDTH = (width - SIDE_PADDING * 2 - CARD_SPACING * 5) / 6;
const TOP_CAROUSEL_HEIGHT = 160;

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

export default styles;
