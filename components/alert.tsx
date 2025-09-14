import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type AlertType = "default" | "success" | "error" | "warning" | "info";
type AnimationType = "fade" | "scale" | "slide";
type ThemeType = "light" | "dark";

interface AlertProps {
  visible?: boolean;
  title?: string;
  message?: string;
  positiveText?: string;
  negativeText?: string;
  onPositivePress?: () => void;
  onNegativePress?: () => void;
  type?: AlertType;
  animationType?: AnimationType;
  overlayClose?: boolean;
  theme?: ThemeType;
  customStyles?: {
    container?: StyleProp<ViewStyle>;
    header?: StyleProp<ViewStyle>;
    headerIcon?: StyleProp<TextStyle>;
    headerTitle?: StyleProp<TextStyle>;
    content?: StyleProp<ViewStyle>;
    message?: StyleProp<TextStyle>;
    buttonContainer?: StyleProp<ViewStyle>;
    positiveButton?: StyleProp<ViewStyle>;
    negativeButton?: StyleProp<ViewStyle>;
    positiveButtonText?: StyleProp<TextStyle>;
    negativeButtonText?: StyleProp<TextStyle>;
  };
}

const Alert: React.FC<AlertProps> = ({
  visible = false,
  title = "",
  message = "",
  positiveText = "OK",
  negativeText = "Cancel",
  onPositivePress,
  onNegativePress,
  type = "default",
  animationType = "fade",
  overlayClose = false,
  theme = "light",
  customStyles = {},
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      animateOut();
    }
  }, [visible]);

  const animateIn = () => {
    if (animationType === "scale") {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else if (animationType === "fade") {
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  const animateOut = () => {
    if (animationType === "scale") {
      Animated.spring(scaleValue, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else if (animationType === "fade") {
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return { headerBg: "#4CAF50", buttonBg: "#388E3C", icon: "✓" };
      case "error":
        return { headerBg: "#F44336", buttonBg: "#D32F2F", icon: "✕" };
      case "warning":
        return { headerBg: "#FF9800", buttonBg: "#F57C00", icon: "⚠" };
      case "info":
        return { headerBg: "#2196F3", buttonBg: "#1976D2", icon: "ℹ" };
      default:
        return { headerBg: "#9C27B0", buttonBg: "#7B1FA2", icon: "!" };
    }
  };

  const getThemeStyles = () => {
    return theme === "dark"
      ? {
          container: styles.containerDark,
          content: styles.contentDark,
          message: styles.messageDark,
          buttonText: styles.buttonTextDark,
        }
      : {
          container: styles.containerLight,
          content: styles.contentLight,
          message: styles.messageLight,
          buttonText: styles.buttonTextLight,
        };
  };

  const typeStyles = getTypeStyles();
  const themeStyles = getThemeStyles();

  const renderAnimation = (): StyleProp<ViewStyle> => {
    if (animationType === "scale") {
      return { transform: [{ scale: scaleValue }] };
    }
    if (animationType === "fade") {
      return { opacity: opacityValue };
    }
    return {};
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType={animationType === "slide" ? "slide" : "none"}
      onRequestClose={onNegativePress}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={overlayClose ? onNegativePress : undefined}
      >
        <Animated.View
          style={[
            styles.container,
            themeStyles.container,
            customStyles.container,
            renderAnimation(),
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: typeStyles.headerBg },
              customStyles.header,
            ]}
          >
            <Text style={[styles.headerIcon, customStyles.headerIcon]}>
              {typeStyles.icon}
            </Text>
            <Text style={[styles.headerTitle, customStyles.headerTitle]}>
              {title}
            </Text>
          </View>

          {/* Content */}
          <View
            style={[styles.content, themeStyles.content, customStyles.content]}
          >
            <Text
              style={[
                styles.message,
                themeStyles.message,
                customStyles.message,
              ]}
            >
              {message}
            </Text>

            {/* Buttons */}
            <View
              style={[styles.buttonContainer, customStyles.buttonContainer]}
            >
              {negativeText && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.negativeButton,
                    customStyles.negativeButton,
                  ]}
                  onPress={onNegativePress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      themeStyles.buttonText,
                      customStyles.negativeButtonText,
                    ]}
                  >
                    {negativeText}
                  </Text>
                </TouchableOpacity>
              )}

              {positiveText && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.positiveButton,
                    { backgroundColor: typeStyles.buttonBg },
                    customStyles.positiveButton,
                  ]}
                  onPress={onPositivePress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      styles.positiveButtonText,
                      customStyles.positiveButtonText,
                    ]}
                  >
                    {positiveText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  containerLight: { backgroundColor: "#FFFFFF" },
  containerDark: { backgroundColor: "#2C2C2C" },
  header: {
    padding: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerIcon: {
    color: "white",
    fontSize: 24,
    marginRight: 10,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: { padding: 24 },
  contentLight: { backgroundColor: "#FFFFFF" },
  contentDark: { backgroundColor: "#2C2C2C" },
  message: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center",
  },
  messageLight: { color: "#666666" },
  messageDark: { color: "#CCCCCC" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  positiveButton: { backgroundColor: "#9C27B0" },
  negativeButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
  buttonTextLight: { color: "#757575" },
  buttonTextDark: { color: "#CCCCCC" },
  positiveButtonText: { color: "white", fontWeight: "bold" },
});

export { Alert };
