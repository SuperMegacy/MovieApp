// src/screens/Screen1.tsx
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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { t } from "../i18n/translation";

type Props = NativeStackScreenProps<RootStackParamList, "Screen1">;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,15}$/;

const Screen1: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const lang = useAppSelector((state) => state.language.language);

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
      <View style={styles.card}>
        <Text style={styles.label}>{t(lang, "email")}</Text>
        <TextInput
          value={email}
          onChangeText={(v) => setEmail(v)}
          onBlur={() => setTouched((s) => ({ ...s, email: true }))}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        {!emailValid && touched.email && (
          <Text style={styles.error}>{t(lang, "invalidEmail")}</Text>
        )}

        <Text style={[styles.label, { marginTop: 16 }]}>{t(lang, "password")}</Text>
        <TextInput
          value={password}
          onChangeText={(v) => setPassword(v)}
          onBlur={() => setTouched((s) => ({ ...s, password: true }))}
          placeholder="••••••••"
          secureTextEntry
          style={styles.input}
        />
        {!passwordValid && touched.password && (
          <Text style={styles.error}>{t(lang, "invalidPassword")}</Text>
        )}

        <TouchableOpacity
          onPress={onSubmit}
          activeOpacity={0.8}
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          disabled={!canSubmit}
        >
          <Text style={styles.buttonText}>{t(lang, "submit")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Screen1;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#f6f6f6" },
  card: { backgroundColor: "white", padding: 20, borderRadius: 12, elevation: 2 },
  label: { fontSize: 14, color: "#333", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  error: { color: "#c00", marginTop: 6, fontSize: 12 },
  button: {
    marginTop: 20,
    backgroundColor: "#0a84ff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#9ecbff" },
  buttonText: { color: "white", fontWeight: "600" },
});
