import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useAuth } from "../../../context/AuthContext";

export default function LoginScreen(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const { selectedCountry } =
    useLocalSearchParams<{ selectedCountry?: string }>();

  // Cargar credenciales guardadas
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        const savedPassword = await AsyncStorage.getItem("savedPassword");

        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log("Error cargando credenciales", error);
      }
    };

    loadCredentials();
  }, []);

  // Validación email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid =
    isValidEmail(email) && password.length >= 3;

  const handleLogin = async (): Promise<void> => {
    if (!isValidEmail(email)) {
      Alert.alert(
        "Error",
        "Ingresa un correo electrónico válido."
      );
      return;
    }

    if (password.length < 3) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 3 caracteres."
      );
      return;
    }

    try {
      await login(email, password);

      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email);
        await AsyncStorage.setItem(
          "savedPassword",
          password
        );
      } else {
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }


      router.push("/aplication/home-app");
    } catch (error) {
      console.error("Error en login:", error);

      Alert.alert(
        "Error",
        "No se pudo iniciar sesión. Verifica tus datos."
      );
    }
  };

  // REDES SOCIALES
  const handleSocialRedirect = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir el enlace.")
    );
  };

  // ICONOS SVG
  const GoogleIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.72 1.3 9.18 3.42l6.84-6.84C35.44 2.24 30.04 0 24 0 14.62 0 6.61 5.64 2.7 13.56l8.33 6.49C13.13 13.09 18.17 9.5 24 9.5z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.04 0 11.44-2.24 15.68-5.89l-7.27-5.94C29.97 37.7 27.05 38.5 24 38.5c-5.83 0-10.87-3.59-13-8.55l-8.33 6.49C6.61 42.36 14.62 48 24 48z"
      />
      <Path
        fill="#4A90E2"
        d="M46.5 24c0-1.36-.12-2.68-.34-3.95H24v9h12.65c-.59 3-2.38 5.52-5.04 7.13l7.27 5.94C43.89 38.28 46.5 31.69 46.5 24z"
      />
      <Path
        fill="#FBBC05"
        d="M11 29.95c-1.11-3.06-1.11-6.4 0-9.45l-8.33-6.49C-.88 20.5-.88 27.5 2.7 34.44L11 29.95z"
      />
    </Svg>
  );

  const FacebookIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 48 48">
      <Path
        fill="#1877F2"
        d="M24 0C10.74 0 0 10.74 0 24c0 11.95 8.75 21.86 20.19 23.7V30.98h-6.07v-6.98h6.07v-5.32c0-6 3.57-9.3 9.04-9.3 2.61 0 5.35.47 5.35.47v5.87h-3.01c-2.97 0-3.9 1.85-3.9 3.75v4.53h6.64l-1.06 6.98h-5.58v16.72C39.25 45.86 48 35.95 48 24 48 10.74 37.26 0 24 0z"
      />
    </Svg>
  );

  const InstagramIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 512 512">
      <Path
        fill="#E1306C"
        d="M349.33 69.33H162.67C112.59 69.33 69.33 112.59 69.33 162.67v186.66c0 50.08 43.26 93.34 93.34 93.34h186.66c50.08 0 93.34-43.26 93.34-93.34V162.67c0-50.08-43.26-93.34-93.34-93.34zm61.34 280c0 33.87-27.47 61.34-61.34 61.34H162.67c-33.87 0-61.34-27.47-61.34-61.34V162.67c0-33.87 27.47-61.34 61.34-61.34h186.66c33.87 0 61.34 27.47 61.34 61.34v186.66z"
      />
      <Path
        fill="#E1306C"
        d="M256 149.33c-58.86 0-106.67 47.81-106.67 106.67S197.14 362.67 256 362.67 362.67 314.86 362.67 256 314.86 149.33 256 149.33zm0 170.67c-35.27 0-64-28.73-64-64s28.73-64 64-64 64 28.73 64 64-28.73 64-64 64z"
      />
      <Circle
        cx="393.6"
        cy="118.4"
        r="17.07"
        fill="#E1306C"
      />
    </Svg>
  );

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../assets/logo.png")}
          style={styles.logo}
        />
      </View>

      {/* TÍTULO */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Ingresar</Text>
      </View>

      <Text style={styles.subtitle}>
        Accede a tu cuenta para continuar
      </Text>

      {/* CAMPOS */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#9aa5a0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#9aa5a0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* RECORDAR */}
      <View style={styles.rememberContainer}>
        <Text style={styles.rememberText}>
          Recordar credenciales
        </Text>

        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{
            false: "#ccc",
            true: "#004d32",
          }}
          thumbColor="#fff"
        />
      </View>

      {/* BOTÓN */}
      <TouchableOpacity
        disabled={!isFormValid}
        onPress={handleLogin}
        style={[
          styles.loginButton,
          !isFormValid && styles.disabledButton,
        ]}
      >
        <Text style={styles.loginButtonText}>
          Ingresar
        </Text>
      </TouchableOpacity>

      {/* País */}
      {selectedCountry && (
        <Text style={styles.countryText}>
          País seleccionado: {selectedCountry}
        </Text>
      )}

      {/* Redes */}
      <Text style={styles.socialTitle}>
        Visítanos en nuestras redes sociales
      </Text>

      <View style={styles.socialContainer}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() =>
            handleSocialRedirect("https://www.google.com")
          }
        >
          <GoogleIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() =>
            handleSocialRedirect(
              "https://facebook.com/TU_PAGINA"
            )
          }
        >
          <FacebookIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() =>
            handleSocialRedirect(
              "https://instagram.com/TU_CUENTA"
            )
          }
        >
          <InstagramIcon />
        </TouchableOpacity>
      </View>

      {/* Links */}
      <View style={styles.linksContainer}>
        <Text
          style={styles.link}
          onPress={() =>
            router.push("/auth/forgot-password")
          }
        >
          ¿Olvidaste tu contraseña?
        </Text>

        <Text
          style={[styles.link, styles.registerLink]}
          onPress={() => router.push("/auth/signup")}
        >
          ¿No tienes cuenta? Regístrate
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },

  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#004d32",
    marginLeft: 8,
  },

  subtitle: {
    textAlign: "center",
    color: "#5c7a70",
    fontSize: 16,
    marginBottom: 24,
  },

  input: {
    height: 48,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f2fdf6",
    borderColor: "#cce3d2",
    color: "#004d32",
  },

  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  rememberText: {
    color: "#004d32",
  },

  loginButton: {
    height: 48,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#004d32",
  },

  disabledButton: {
    backgroundColor: "#d1d5db",
  },

  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  countryText: {
    textAlign: "center",
    marginTop: 8,
    color: "#004d32",
    fontWeight: "500",
  },

  socialTitle: {
    textAlign: "center",
    color: "#004d32",
    marginTop: 24,
    marginBottom: 12,
    fontWeight: "bold",
  },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },

  socialButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,

    elevation: 4,
  },

  linksContainer: {
    marginTop: 20,
  },

  link: {
    textAlign: "center",
    fontSize: 12,
    textDecorationLine: "underline",
    color: "#004d32",
  },

  registerLink: {
    marginTop: 8,
  },
});