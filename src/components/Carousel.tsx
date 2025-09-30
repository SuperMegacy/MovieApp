import React, { useRef, useEffect } from "react";
import { FlatList, TouchableOpacity, Image, View, Text, Dimensions } from "react-native";
import { Movie, IMAGE_BASE } from "../api/tmdb";
import styles from "../styles/screen2.styles";

const { width } = Dimensions.get("window");

type Props = {
  items: Movie[];
  onPress: (m: Movie) => void;
};

const Carousel: React.FC<Props> = ({ items, onPress }) => {
  const carouselFlatRef = useRef<FlatList<Movie>>(null);
  const carouselIndexRef = useRef(0);

  // Autoplay
  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => {
      if (!carouselFlatRef.current) return;
      carouselIndexRef.current = (carouselIndexRef.current + 1) % items.length;
      carouselFlatRef.current.scrollToIndex({
        index: carouselIndexRef.current,
        animated: true,
      });
    }, 4000);
    return () => clearInterval(id);
  }, [items]);

  return (
    <View style={styles.carouselWrap}>
      <FlatList
        ref={carouselFlatRef}
        data={items}
        horizontal
        keyExtractor={(it) => it.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPress(item)}
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
      />
    </View>
  );
};

export default Carousel;
