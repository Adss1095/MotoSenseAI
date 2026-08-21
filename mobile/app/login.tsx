import React, { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");

  // ============================================================
  // EMAIL VALIDATION
  // ============================================================

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
      value.trim()
    );
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = () => {
  console.log("LOGIN BUTTON PRESSED");

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Check that both fields are filled
  if (!cleanEmail || !cleanPassword) {
    Alert.alert(
      "Missing Information",
      "Please enter your email and password."
    );
    return;
  }

  // 2. Check email format
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  if (!emailRegex.test(cleanEmail)) {
    Alert.alert(
      "Invalid Email",
      "Please enter a valid email address."
    );
    return;
  }

  // 3. Temporary login credentials
  const VALID_EMAIL = "motosenseai@gmail.com";
  const VALID_PASSWORD = "motosenseai";

  // 4. Check credentials
  if (
    cleanEmail !== VALID_EMAIL ||
    cleanPassword !== VALID_PASSWORD
  ) {
    Alert.alert(
      "Login Failed",
      "Incorrect email or password."
    );
    return;
  }

  console.log("LOGIN SUCCESSFUL");

  // 5. GO DIRECTLY TO YOUR EXISTING DASHBOARD
  router.replace("/dashboard");
};

  // ============================================================
  // UI
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
          <Text style={styles.welcome}>
            Welcome to
          </Text>

          <Text style={styles.logo}>
            MotoSense
            <Text style={styles.logoAI}>AI</Text>
          </Text>

          <Text style={styles.subtitle}>
            Your AI-Powered Riding Companion
          </Text>

          <View style={styles.headerLine}>
            <View style={styles.headerLineFill} />
            <View style={styles.headerDot} />
          </View>
        </View>

        {/* =====================================================
            LOGIN CARD
        ===================================================== */}

        <View style={styles.card}>

          {/* ===================================================
              EMAIL
          =================================================== */}

          <View>
            <View
              style={[
                styles.inputContainer,
                emailError && styles.inputError,
              ]}
            >
              <Text style={styles.inputIcon}>
                ✉
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#718096"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);

                  if (emailError) {
                    setEmailError("");
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            {emailError ? (
              <Text style={styles.errorText}>
                {emailError}
              </Text>
            ) : null}
          </View>

          {/* ===================================================
              PASSWORD
          =================================================== */}

          <View style={styles.passwordWrapper}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>
                🔒
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#718096"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
              />

              <Pressable
                onPress={() =>
                  setShowPassword(!showPassword)
                }
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? "◉" : "◌"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ===================================================
              FORGOT PASSWORD
          =================================================== */}

          <Pressable
            onPress={() =>
              Alert.alert(
                "Forgot Password",
                "Password recovery will be connected later."
              )
            }
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>
              Forgot Password?
            </Text>
          </Pressable>

          {/* ===================================================
              LOGIN BUTTON
          =================================================== */}

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.loginButtonText}>
              Log In
            </Text>
          </Pressable>

          {/* ===================================================
              DIVIDER
          =================================================== */}

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>
              OR
            </Text>

            <View style={styles.divider} />
          </View>

          {/* ===================================================
              GOOGLE
          =================================================== */}

          <Pressable
            onPress={() =>
              Alert.alert(
                "Google Login",
                "Google authentication will be connected later."
              )
            }
            style={styles.socialButton}
          >
            <Text style={styles.googleIcon}>
              G
            </Text>

            <Text style={styles.socialText}>
              Continue with Google
            </Text>
          </Pressable>

          {/* ===================================================
              APPLE
          =================================================== */}

          <Pressable
            onPress={() =>
              Alert.alert(
                "Apple Login",
                "Apple authentication will be connected later."
              )
            }
            style={styles.socialButton}
          >
            <Text style={styles.appleIcon}>
              
            </Text>

            <Text style={styles.socialText}>
              Continue with Apple
            </Text>
          </Pressable>

          {/* ===================================================
              SIGN UP
          =================================================== */}

          <View style={styles.signupContainer}>
            <Text style={styles.signupNormal}>
              {"Don't have an account? "}
            </Text>

            <Pressable
              onPress={() =>
                Alert.alert(
                  "Sign Up",
                  "Registration screen will be added next."
                )
              }
            >
              <Text style={styles.signupLink}>
                Sign Up
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020A12",
  },

  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 40,
  },

  // ==============================================================
  // HEADER
  // ==============================================================

  header: {
    marginBottom: 28,
  },

  welcome: {
    color: "#A9B7C8",
    fontSize: 30,
    fontWeight: "400",
    marginBottom: 4,
  },

  logo: {
    color: "#F5F7FA",
    fontSize: 43,
    fontWeight: "800",
    letterSpacing: -1.5,
  },

  logoAI: {
    color: "#12BDF3",
  },

  subtitle: {
    marginTop: 8,
    color: "#8EA0B5",
    fontSize: 18,
  },

  headerLine: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
  },

  headerLineFill: {
    width: 290,
    height: 2,
    backgroundColor: "#16BDF2",
  },

  headerDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#16BDF2",
    marginLeft: -1,
  },

  // ==============================================================
  // CARD
  // ==============================================================

  card: {
    borderWidth: 1,
    borderColor: "#172B3A",
    borderRadius: 25,
    padding: 24,
    backgroundColor: "rgba(5, 17, 27, 0.75)",
  },

  // ==============================================================
  // INPUT
  // ==============================================================

  inputContainer: {
    height: 76,
    borderWidth: 1,
    borderColor: "#1D3445",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: "#06121B",
  },

  inputError: {
    borderColor: "#E85D75",
  },

  inputIcon: {
    color: "#B4C0CF",
    fontSize: 23,
    width: 42,
  },

  input: {
    flex: 1,
    color: "#F4F7FA",
    fontSize: 17,
    height: "100%",
  },

  passwordWrapper: {
    marginTop: 18,
  },

  eyeButton: {
    padding: 8,
  },

  eyeIcon: {
    color: "#8998A9",
    fontSize: 22,
  },

  errorText: {
    color: "#FF7187",
    fontSize: 13,
    marginTop: 7,
    marginLeft: 8,
  },

  // ==============================================================
  // FORGOT PASSWORD
  // ==============================================================

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 15,
    marginBottom: 24,
  },

  forgotText: {
    color: "#11BDF4",
    fontSize: 16,
    fontWeight: "600",
  },

  // ==============================================================
  // LOGIN BUTTON
  // ==============================================================

  loginButton: {
    height: 68,
    borderRadius: 19,
    backgroundColor: "#13BCEF",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  loginButtonText: {
    color: "#021018",
    fontSize: 19,
    fontWeight: "800",
  },

  // ==============================================================
  // DIVIDER
  // ==============================================================

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#1B2C3A",
  },

  orText: {
    color: "#8795A5",
    marginHorizontal: 16,
    fontSize: 15,
  },

  // ==============================================================
  // SOCIAL BUTTONS
  // ==============================================================

  socialButton: {
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1D3445",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    backgroundColor: "#041019",
  },

  googleIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    marginRight: 18,
  },

  appleIcon: {
    color: "#FFFFFF",
    fontSize: 25,
    marginRight: 18,
  },

  socialText: {
    color: "#F0F4F8",
    fontSize: 16,
    fontWeight: "500",
  },

  // ==============================================================
  // SIGN UP
  // ==============================================================

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  signupNormal: {
    color: "#8C9AAA",
    fontSize: 15,
  },

  signupLink: {
    color: "#11BDF4",
    fontSize: 15,
    fontWeight: "600",
  },
});