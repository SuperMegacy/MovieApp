import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Movie, IMAGE_BASE } from "../api/tmdb";
import styles from "../styles/screen2.styles";


type Props = {
    item: Movie;
    onPress: (m: Movie) => void;
};

const MovieCard: React.FC<Props> = ({ item, onPress }) => {
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

export default MovieCard;