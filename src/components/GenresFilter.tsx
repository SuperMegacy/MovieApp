import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Genre } from "../api/tmdb";
import styles from "../styles/screen2.styles";

type Props = {
  genres: Genre[];
  selected: number | null;
  onSelect: (id: number | null) => void;
};

const GenresFilter: React.FC<Props> = ({ genres, selected, onSelect }) => (
  <View style={styles.genresContainer}>
    <Text style={styles.genresTitle}>Genres</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genresScroll}>
      <TouchableOpacity
        style={[styles.genreChip, selected === null && styles.genreChipSelected]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.genreChipText, selected === null && styles.genreChipTextSelected]}>
          All
        </Text>
      </TouchableOpacity>
      {genres.map((g) => (
        <TouchableOpacity
          key={g.id}
          style={[styles.genreChip, selected === g.id && styles.genreChipSelected]}
          onPress={() => onSelect(g.id)}
        >
          <Text style={[styles.genreChipText, selected === g.id && styles.genreChipTextSelected]}>
            {g.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default GenresFilter;
