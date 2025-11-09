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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
  positiveText,
  negativeText,
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
        return {
          headerBg: "#00aa6f",
          buttonBg: "#008f5c",
          icon: "check-circle",
        };
      case "error":
        return { headerBg: "#dc2626", buttonBg: "#b91c1c", icon: "cancel" };
      case "warning":
        return { headerBg: "#f97316", buttonBg: "#ea580c", icon: "warning" };
      case "info":
        return { headerBg: "#3b82f6", buttonBg: "#2563eb", icon: "info" };
      default:
        return {
          headerBg: "#6b7280",
          buttonBg: "#4b5563",
          icon: "notifications",
        };
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
            <MaterialIcons
              name={typeStyles.icon as any}
              size={28}
              color="white"
              style={[styles.headerIcon, customStyles.headerIcon]}
            />
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
    width: "90%",
    maxWidth: 400,
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
    padding: 20,
    paddingHorizontal: 36,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: { padding: 18, paddingTop: 0 },
  contentLight: { backgroundColor: "#FFFFFF" },
  contentDark: { backgroundColor: "#2C2C2C" },
  message: {
    fontSize: 22,
    marginBlock: 36,
    lineHeight: 28,
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
  positiveButton: { backgroundColor: "#6b7280" },
  negativeButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  buttonText: { fontSize: 18 },
  buttonTextLight: { color: "#757575" },
  buttonTextDark: { color: "#CCCCCC" },
  positiveButtonText: { color: "white" },
});

export { Alert };
