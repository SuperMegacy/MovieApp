import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Movie, IMAGE_BASE } from "../api/tmdb";
import styles from "../styles/screen2.styles";

type Props = {
  visible: boolean;
  movie: Movie | null;
  onClose: () => void;
};

const MovieModal: React.FC<Props> = ({ visible, movie, onClose }) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <ScrollView>
          {movie?.poster_path ? (
            <Image
              source={{ uri: `${IMAGE_BASE}${movie.poster_path}` }}
              style={styles.modalPoster}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.modalPoster, styles.noImage]}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{movie?.title}</Text>
            <View style={styles.modalDetails}>
              {movie?.release_date ? (
                <Text style={styles.modalSub}>📅 {movie.release_date}</Text>
              ) : null}
              {movie?.vote_average ? (
                <Text style={styles.modalSub}>⭐ {movie.vote_average}/10</Text>
              ) : null}
            </View>
            <Text style={styles.modalOverview}>{movie?.overview}</Text>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default MovieModal;
