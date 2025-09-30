import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import styles from "../styles/screen2.styles";

interface Props {
    active?: boolean;
    onPress: () => void;
    label: string;
}

const PaginationButton: React.FC<Props> = ({ active, onPress, label }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.pageBtn, active ? styles.pageBtnActive : undefined]}
        activeOpacity={0.8}
    >
        <Text style={[styles.pageBtnText, active ? styles.pageBtnTextActive : undefined]}>{label}</Text>
    </TouchableOpacity>
);

export default PaginationButton;