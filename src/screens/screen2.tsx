// src/screens/Screen2.tsx
import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { getPopularMovies, IMAGE_BASE, Movie } from "../api/tmdb";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials } from "../store/authSlice";
import { t } from "../i18n/translation";
import { setLanguage } from "../store/languageSlice";

const { width } = Dimensions.get("window");
const ITEM_PADDING = 12;
const ITEM_WIDTH = (width - ITEM_PADDING * 3) / 2;

const MovieCard: React.FC<{ item: Movie }> = ({ item }) => {
  const posterUrl = item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : undefined;
  return (
    <View style={styles.card}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.noImage]}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
    </View>
  );
};

const Screen2: React.FC = () => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.language.language);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async (p = 1, replace = true) => {
    try {
      if (p === 1) setLoading(true);
      const res = await getPopularMovies(p);
      setMovies((old) => (replace ? res.results : [...old, ...res.results]));
    } catch (err) {
      console.error("Failed loading movies", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(1, true);
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(1, true);
    setPage(1);
  }, [load]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, false);
  };

  const onLogout = () => {
    dispatch(clearCredentials());
  };

  const toggleLang = () => {
    const newLang = lang === "en" ? "ar" : "en";
    dispatch(setLanguage(newLang));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t(lang, "popularMovies")}</Text>

        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {lang === "en" ? t("en", "switchToArabic") : t("ar", "switchToEnglish")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} style={styles.langBtn}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>{t(lang, "logout")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <MovieCard item={item} />}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: ITEM_PADDING }}
          contentContainerStyle={{ paddingVertical: 12 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

export default Screen2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  langBtn: {
    backgroundColor: "#0a84ff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  poster: {
    width: "100%",
    height: ITEM_WIDTH * 1.5,
    backgroundColor: "#ddd",
  },
  noImage: { alignItems: "center", justifyContent: "center" },
  title: { padding: 8, fontSize: 14, fontWeight: "600" },
});
