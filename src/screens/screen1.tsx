
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useTranslation } from "../store/hooks";

type Props = NativeStackScreenProps<RootStackParamList, "Screen1">;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,15}$/;

const Screen1: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailValid = useMemo(() => emailRegex.test(email), [email]);
  const passwordValid = useMemo(() => passwordRegex.test(password), [password]);
  const canSubmit = emailValid && passwordValid;

  function onSubmit() {
    if (!canSubmit) return;
    dispatch(setCredentials({ email, password }));
    navigation.replace("Screen2");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.container}
    >
      <Animated.View
        style={styles.card}
        entering={FadeInRight.duration(350)}
        exiting={FadeOutLeft.duration(250)}
        key={mode}
      >
        <Text style={styles.title}>🎬 MovieApp</Text>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === "login" && styles.tabActive]}
            onPress={() => setMode("login")}
          >
            <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
              {t("login")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, mode === "register" && styles.tabActive]}
            onPress={() => setMode("register")}
          >
            <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>
              {t("register")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{t("email")}</Text>
        <TextInput
          value={email}
          onChangeText={(v) => setEmail(v)}
          onBlur={() => setTouched((s) => ({ ...s, email: true }))}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor="#999"
        />
        {!emailValid && touched.email && <Text style={styles.error}>{t("invalidEmail")}</Text>}

        <Text style={[styles.label, { marginTop: 12 }]}>{t("password")}</Text>
        <TextInput
          value={password}
          onChangeText={(v) => setPassword(v)}
          onBlur={() => setTouched((s) => ({ ...s, password: true }))}
          placeholder="••••••••"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />
        {!passwordValid && touched.password && (
          <Text style={styles.error}>{t("invalidPassword")}</Text>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          activeOpacity={0.85}
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          disabled={!canSubmit}
        >
          <Text style={styles.buttonText}>{mode === "login" ? t("login") : t("register")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default Screen1;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#0f0f1a" },

  card: {
    backgroundColor: "#1a1a2e",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    marginHorizontal: 16,
  },

  title: { fontSize: 22, color: "#fff", fontWeight: "800", marginBottom: 12, textAlign: "center" },

  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0f0f1a",
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#0a84ff" },
  tabText: { color: "#cbd5e1", fontWeight: "600" },
  tabTextActive: { color: "#fff", fontWeight: "800" },

  label: { color: "#cbd5e1", marginBottom: 6 },
  input: {
    backgroundColor: "#0f0f1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    marginBottom: 10,
  },
  error: { color: "#ff6b6b", marginTop: 6, marginBottom: 6 },

  button: {
    marginTop: 10,
    backgroundColor: "#0a84ff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#5aa7ff" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
